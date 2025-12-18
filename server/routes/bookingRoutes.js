import express from 'express';
import { getMyBookings, createBooking, getBooking } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMyBookings);
router.post('/', protect, createBooking);
router.get('/:id', protect, getBooking);

export default router;


