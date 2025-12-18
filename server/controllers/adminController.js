import MuseumBooking from '../models/MuseumBooking.js';
import SupportTicket from '../models/SupportTicket.js';
import User from '../models/User.js';
import Museum from '../models/Museum.js';

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const { museum, status, date, search, bookingId, userEmail } = req.query;
    let query = {};

    // Filter by museum
    if (museum) query.museum = museum;
    
    // Filter by status
    if (status) query.paymentStatus = status;
    
    // Filter by date
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Filter by booking ID
    if (bookingId) {
      query.bookingId = { $regex: bookingId, $options: 'i' };
    }

    let bookings = await MuseumBooking.find(query)
      .populate('user', 'name email')
      .populate('museum', 'name location')
      .sort({ createdAt: -1 });

    // Search by user email (client-side filtering for better flexibility)
    if (userEmail) {
      bookings = bookings.filter(
        (booking) =>
          booking.user?.email?.toLowerCase().includes(userEmail.toLowerCase())
      );
    }

    // General search across booking ID, user name, and museum name
    if (search) {
      const searchLower = search.toLowerCase();
      bookings = bookings.filter(
        (booking) =>
          booking.bookingId.toLowerCase().includes(searchLower) ||
          booking.user?.name?.toLowerCase().includes(searchLower) ||
          booking.user?.email?.toLowerCase().includes(searchLower) ||
          booking.museum?.name?.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all support tickets
// @route   GET /api/admin/tickets
// @access  Private/Admin
export const getAllTickets = async (req, res) => {
  try {
    const { status, priority } = req.query;
    let query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tickets = await SupportTicket.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update support ticket status
// @route   PUT /api/admin/tickets/:id
// @access  Private/Admin
export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Open', 'In Progress', 'Resolved'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all museums (admin)
// @route   GET /api/admin/museums
// @access  Private/Admin
export const getAllMuseums = async (req, res) => {
  try {
    const museums = await Museum.find().sort({ name: 1 });
    res.json({
      success: true,
      data: museums,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create museum
// @route   POST /api/admin/museums
// @access  Private/Admin
export const createMuseum = async (req, res) => {
  try {
    const { name, description, location, price, imageUrl, isActive } = req.body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existing = await Museum.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Museum with this name already exists' });
    }

    const museum = await Museum.create({
      name,
      slug,
      description: description || '',
      location: location || 'Bengaluru',
      price,
      imageUrl: imageUrl || '',
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      data: museum,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update museum
// @route   PUT /api/admin/museums/:id
// @access  Private/Admin
export const updateMuseum = async (req, res) => {
  try {
    const { name, description, location, price, imageUrl, isActive } = req.body;

    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (price !== undefined) updateData.price = price;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isActive !== undefined) updateData.isActive = isActive;

    // If name changes, update slug
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const existing = await Museum.findOne({ slug, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Museum with this name already exists' });
      }
      updateData.name = name;
      updateData.slug = slug;
    }

    const museum = await Museum.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!museum) {
      return res.status(404).json({ success: false, message: 'Museum not found' });
    }

    res.json({
      success: true,
      data: museum,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete museum
// @route   DELETE /api/admin/museums/:id
// @access  Private/Admin
export const deleteMuseum = async (req, res) => {
  try {
    const museum = await Museum.findByIdAndDelete(req.params.id);

    if (!museum) {
      return res.status(404).json({ success: false, message: 'Museum not found' });
    }

    res.json({
      success: true,
      message: 'Museum deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

