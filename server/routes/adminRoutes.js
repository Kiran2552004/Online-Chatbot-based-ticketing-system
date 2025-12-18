import express from 'express';
import {
  getAllBookings,
  getAllTickets,
  updateTicketStatus,
  getAllUsers,
  getAllMuseums,
  createMuseum,
  updateMuseum,
  deleteMuseum,
} from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

router.get('/bookings', getAllBookings);
router.get('/tickets', getAllTickets);
router.put('/tickets/:id', updateTicketStatus);
router.get('/users', getAllUsers);
router.get('/museums', getAllMuseums);
router.post('/museums', createMuseum);
router.put('/museums/:id', updateMuseum);
router.delete('/museums/:id', deleteMuseum);

export default router;


