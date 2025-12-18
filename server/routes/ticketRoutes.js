import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { protect } from '../middleware/authMiddleware.js';
import MuseumBooking from '../models/MuseumBooking.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// @desc    Download ticket PDF
// @route   GET /api/tickets/:bookingId
// @access  Private
router.get('/:bookingId', protect, async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find booking
    const booking = await MuseumBooking.findOne({ bookingId })
      .populate('user', 'name email')
      .populate('museum', 'name location imageUrl');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check if PDF exists
    const pdfPath = join(__dirname, '..', 'tickets', `${bookingId}.pdf`);
    
    if (!existsSync(pdfPath)) {
      return res.status(404).json({ success: false, message: 'Ticket PDF not found' });
    }

    // Send PDF file
    res.sendFile(pdfPath);
  } catch (error) {
    console.error('PDF download error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


