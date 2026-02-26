import Stripe from 'stripe';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import MuseumBooking from '../models/MuseumBooking.js';
import Museum from '../models/Museum.js';
import { generateBookingId } from '../utils/generateBookingId.js';
import { sendBookingConfirmation, sendTicketEmail } from '../utils/emailService.js';
import { generateTicketPDF } from '../utils/pdfGenerator.js';
import User from '../models/User.js';

// Lazy initialization of Stripe to ensure env vars are loaded
let stripeInstance = null;
const getStripe = () => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
};

// @desc    Create Stripe checkout session
// @route   POST /api/payment/create-checkout-session
// @access  Private
export const createCheckoutSession = async (req, res) => {
  try {
    const { museumId, date, ticketCount, amount, currency = 'inr' } = req.body;

    if (!museumId || !date || !ticketCount || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required booking information' });
    }

    const museum = await Museum.findById(museumId);
    if (!museum) {
      return res.status(404).json({ success: false, message: 'Museum not found' });
    }

    // Convert amount to paise (smallest currency unit for INR)
    const amountInPaise = Math.round(amount * 100);

    // Generate booking ID
    let bookingId;
    let isUnique = false;
    while (!isUnique) {
      bookingId = generateBookingId();
      const existing = await MuseumBooking.findOne({ bookingId });
      if (!existing) isUnique = true;
    }

    // Create a booking with pending status first
    const booking = await MuseumBooking.create({
      user: req.user._id,
      museum: museumId,
      date: new Date(date),
      ticketCount,
      amount,
      paymentStatus: 'pending',
      bookingId,
    });

    // Create Stripe Checkout Session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `${museum.name} - Museum Tickets`,
              description: `${ticketCount} ticket(s) for ${new Date(date).toLocaleDateString('en-IN')}`,
            },
            unit_amount: amountInPaise,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/booking-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/booking-cancelled`,
      client_reference_id: bookingId,
      metadata: {
        bookingId: bookingId,
        userId: req.user._id.toString(),
        museumId: museumId.toString(),
      },
    });

    // Update booking with session ID
    booking.stripePaymentIntentId = session.id;
    await booking.save();

    res.json({
      success: true,
      data: {
        checkoutUrl: session.url,
        sessionId: session.id,
        bookingId,
      },
    });
  } catch (error) {
    console.error('Stripe error:', error);

    // Handle Stripe minimum amount error silently
    if (error.type === 'StripeInvalidRequestError' &&
      error.message &&
      error.message.includes('at least 50 cents')) {
      // Return a generic error without exposing Stripe's minimum requirement
      return res.status(400).json({
        success: false,
        code: 'PAYMENT_ERROR',
        message: 'Unable to process payment for this amount. Please try booking more tickets or contact support.'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error creating payment session. Please try again.'
    });
  }
};

// @desc    Verify payment and update booking
// @route   POST /api/payment/verify-payment
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }

    // Retrieve the session from Stripe
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Find booking by booking ID from metadata
      const bookingId = session.metadata?.bookingId;
      if (!bookingId) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      let booking = await MuseumBooking.findOne({ bookingId })
        .populate('museum', 'name location imageUrl')
        .populate('user', 'name email');

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      // Update booking status if not already paid
      if (booking.paymentStatus !== 'paid') {
        // Use atomic update to prevent race conditions that could trigger double emails
        const updatedBooking = await MuseumBooking.findOneAndUpdate(
          { _id: booking._id, paymentStatus: { $ne: 'paid' } },
          { $set: { paymentStatus: 'paid', stripePaymentIntentId: sessionId } },
          { new: true }
        )
          .populate('museum', 'name location imageUrl')
          .populate('user', 'name email');

        if (updatedBooking) {
          booking = updatedBooking;

          // Generate PDF ticket
          try {
            const user = await User.findById(booking.user._id || booking.user);
            const pdfPath = await generateTicketPDF({
              bookingId: booking.bookingId,
              userName: user.name,
              museumName: booking.museum.name,
              date: booking.date,
              ticketCount: booking.ticketCount,
              amount: booking.amount,
            });

            // Set PDF URL
            booking.pdfUrl = `/api/tickets/${booking.bookingId}`;

            await booking.save();

            // Send email with PDF attachment
            if (user && user.email) {
              await sendTicketEmail(user.email, {
                museumName: booking.museum.name,
                date: booking.date,
                ticketCount: booking.ticketCount,
                amount: booking.amount,
                bookingId: booking.bookingId,
                userName: user.name,
              }, pdfPath);
            }
          } catch (pdfError) {
            console.error('PDF generation error:', pdfError);
            // Still save booking even if PDF generation fails
            await booking.save();
            // Send regular confirmation email as fallback
            const user = await User.findById(booking.user._id || booking.user);
            if (user && user.email) {
              await sendBookingConfirmation(user.email, {
                museumName: booking.museum.name,
                date: booking.date,
                ticketCount: booking.ticketCount,
                amount: booking.amount,
                bookingId: booking.bookingId,
              });
            }
          }
        }
      }

      res.json({
        success: true,
        data: booking,
      });
    } else {
      res.status(400).json({ success: false, message: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

