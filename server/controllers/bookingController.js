import MuseumBooking from '../models/MuseumBooking.js';
import Museum from '../models/Museum.js';
import { generateBookingId } from '../utils/generateBookingId.js';
import { sendBookingConfirmation } from '../utils/emailService.js';
import User from '../models/User.js';

// @desc    Get user's bookings
// @route   GET /api/bookings
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await MuseumBooking.find({ user: req.user._id })
      .populate('museum', 'name location imageUrl')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const { museumId, date, ticketCount, amount, stripePaymentIntentId } = req.body;

    const museum = await Museum.findById(museumId);
    if (!museum) {
      return res.status(404).json({ success: false, message: 'Museum not found' });
    }

    // Generate unique booking ID
    let bookingId;
    let isUnique = false;
    while (!isUnique) {
      bookingId = generateBookingId();
      const existing = await MuseumBooking.findOne({ bookingId });
      if (!existing) isUnique = true;
    }

    const booking = await MuseumBooking.create({
      user: req.user._id,
      museum: museumId,
      date: new Date(date),
      ticketCount,
      amount,
      paymentStatus: stripePaymentIntentId ? 'paid' : 'pending',
      stripePaymentIntentId: stripePaymentIntentId || '',
      bookingId,
    });

    const populatedBooking = await MuseumBooking.findById(booking._id)
      .populate('museum', 'name location imageUrl');

    // Send confirmation email
    const user = await User.findById(req.user._id);
    if (user && user.email) {
      await sendBookingConfirmation(user.email, {
        museumName: museum.name,
        date: new Date(date),
        ticketCount,
        amount,
        bookingId,
      });
    }

    res.status(201).json({
      success: true,
      data: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = async (req, res) => {
  try {
    const booking = await MuseumBooking.findById(req.params.id)
      .populate('museum', 'name location imageUrl')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


