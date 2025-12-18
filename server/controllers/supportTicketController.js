import SupportTicket from '../models/SupportTicket.js';

// @desc    Get user's support tickets
// @route   GET /api/support-tickets
// @access  Private
export const getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single support ticket
// @route   GET /api/support-tickets/:id
// @access  Private
export const getTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Check if user owns the ticket or is admin
    if (ticket.user && ticket.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


