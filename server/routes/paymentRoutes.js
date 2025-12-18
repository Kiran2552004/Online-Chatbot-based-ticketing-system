import express from 'express';
import { createCheckoutSession, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/verify-payment', protect, verifyPayment);

export default router;


