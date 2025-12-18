import express from 'express';
import { getMyTickets, getTicket } from '../controllers/supportTicketController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMyTickets);
router.get('/:id', protect, getTicket);

export default router;


