import express from 'express';
import {
    createSupportTicket,
    getMyTickets,
    getTicket,
    updateSupportTicketStatus,
} from '../controllers/supportTicketController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/support-tickets  — Create a new ticket (auth required)
router.post('/', protect, createSupportTicket);

// @route   GET /api/support-tickets   — Get current user's tickets (auth required)
router.get('/', protect, getMyTickets);

// @route   GET /api/support-tickets/:id — Get single ticket (auth required)
router.get('/:id', protect, getTicket);

// @route   PUT /api/support-tickets/:id — Update ticket status (admin only)
router.put('/:id', protect, isAdmin, updateSupportTicketStatus);

export default router;
