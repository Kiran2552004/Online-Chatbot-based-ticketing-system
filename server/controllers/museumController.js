import Museum from '../models/Museum.js';

// @desc    Get all museums
// @route   GET /api/museums
// @access  Public
export const getMuseums = async (req, res) => {
  try {
    const museums = await Museum.find({ isActive: true }).sort({ name: 1 });
    res.json({
      success: true,
      data: museums,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single museum
// @route   GET /api/museums/:id
// @access  Public
export const getMuseum = async (req, res) => {
  try {
    const museum = await Museum.findById(req.params.id);
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


