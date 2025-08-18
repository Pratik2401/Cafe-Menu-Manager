const ImageUpload = require('../models/ImageUploadModel.js');

const getAllImageUploads = async (req, res) => {
  try {
    const imageUploads = await ImageUpload.find({ isActive: true, isVisible: true }).sort({ createdAt: -1 });
    res.json(imageUploads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch image uploads', details: error.message });
  }
};

module.exports = {
  getAllImageUploads
};