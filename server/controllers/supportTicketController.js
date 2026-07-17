import SupportTicket from '../models/SupportTicket.js';
import { generateTicketId } from '../utils/generateTicketId.js';
import { sendSupportTicketConfirmation } from '../utils/emailService.js';

// @desc    Create support ticket
// @route   POST /api/support-tickets
// @access  Private
export const createSupportTicket = async (req, res) => {
  try {
    const { issueType, description, priority } = req.body;

    // --- Input Validation ---
    if (!issueType || issueType.trim() === '') {
      return res.status(400).json({ success: false, message: 'Issue type is required' });
    }

    if (!description || description.trim() === '') {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }

    const validPriorities = ['Low', 'Medium', 'High'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be Low, Medium, or High',
      });
    }

    // Auto-fetch name & email from authenticated user
    const { name, email } = req.user;

    const ticketId = generateTicketId();

    const ticket = await SupportTicket.create({
      user: req.user._id,
      name,
      email,
      issueType: issueType.trim(),
      description: description.trim(),
      priority: priority || 'Medium',
      status: 'Open',
      ticketId,
    });

    // Send confirmation email (non-blocking — don't fail the response if email fails)
    sendSupportTicketConfirmation(email, {
      ticketId,
      name,
      issueType: ticket.issueType,
      description: ticket.description,
    }).catch((err) => console.error('Support ticket email error:', err));

    return res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: ticket,
    });
  } catch (error) {
    console.error('createSupportTicket error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's support tickets
// @route   GET /api/support-tickets
// @access  Private
export const getMyTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await SupportTicket.countDocuments({ user: req.user._id });
    const tickets = await SupportTicket.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      data: tickets,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single support ticket
// @route   GET /api/support-tickets/:id
// @access  Private
export const getTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate('user', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Check if user owns the ticket or is admin
    if (
      ticket.user &&
      ticket.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    return res.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update support ticket status (Admin only)
// @route   PUT /api/support-tickets/:id
// @access  Private/Admin
export const updateSupportTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Open', 'In Progress', 'Resolved'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be Open, In Progress, or Resolved',
      });
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    return res.json({
      success: true,
      message: 'Ticket status updated',
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
