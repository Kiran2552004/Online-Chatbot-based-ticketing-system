import mongoose from 'mongoose';

const museumBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  museum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Museum',
    required: true,
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required'],
  },
  ticketCount: {
    type: Number,
    required: [true, 'Ticket count is required'],
    min: 1,
  },
  amount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  stripePaymentIntentId: {
    type: String,
    default: '',
  },
  bookingId: {
    type: String,
    required: true,
    unique: true,
  },
  pdfUrl: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const MuseumBooking = mongoose.model('MuseumBooking', museumBookingSchema);

export default MuseumBooking;

