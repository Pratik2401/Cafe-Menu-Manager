const ImageUpload = require('../models/ImageUploadModel.js');
const { uploadImage, deleteImage } = require('../utils/imageUploads.js');

const createImageUpload = async (req, res) => {
  try {
    const { message } = req.body;
    const file = req.file;

    if (!message || !file) {
      res.status(400).json({ error: 'Message and image file are required' });
      return;
    }

    const imageUrl = await uploadImage(file.buffer, file.originalname, 'backgrounds');
    const imageUpload = new ImageUpload({ imageUrl, message });
    await imageUpload.save();

    // Always return a public image URL, never a blob URL
    res.status(201).json({
      ...imageUpload.toObject(),
      backgroundImage: imageUrl // For frontend compatibility
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create image upload', details: error.message });
  }
};

const getAllImageUploads = async (req, res) => {
  try {
    const imageUploads = await ImageUpload.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(imageUploads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch image uploads', details: error.message });
  }
};

const toggleImageUploadVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const imageUpload = await ImageUpload.findById(id);
    
    if (!imageUpload) {
      res.status(404).json({ error: 'Image upload not found' });
      return;
    }
    
    imageUpload.isVisible = !imageUpload.isVisible;
    await imageUpload.save();
    
    res.json({ message: 'Visibility toggled successfully', imageUpload });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle visibility', details: error.message });
  }
};

const deleteImageUpload = async (req, res) => {
  try {
    const imageUpload = await ImageUpload.findById(req.params.id);
    if (!imageUpload) {
      res.status(404).json({ error: 'Image upload not found' });
      return;
    }

    if (imageUpload.imageUrl) {
      deleteImage(imageUpload.imageUrl);
    }

    await ImageUpload.findByIdAndDelete(req.params.id);
    res.json({ message: 'Image upload deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete image upload', details: error.message });
  }
};

module.exports = {
  createImageUpload,
  getAllImageUploads,
  deleteImageUpload,
  toggleImageUploadVisibility
};