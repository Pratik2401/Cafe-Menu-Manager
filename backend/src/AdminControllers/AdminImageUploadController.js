const ImageUpload = require('../models/ImageUploadModel.js');
const { uploadImage, deleteImage } = require('../utils/imageUploads.js');

const createImageUpload = async (req, res) => {
  try {
    console.log('📸 Image upload request received');
    console.log('📸 Request body:', req.body);
    console.log('📸 Request file:', req.file ? { 
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      hasBuffer: !!req.file.buffer
    } : 'No file');
    
    const { message } = req.body;
    const file = req.file;

    if (!file) {
      console.log('📸 Missing required fields:', { message: !!message, file: !!file });
      res.status(400).json({ error: 'Image file is required' });
      return;
    }

    console.log('📸 Attempting to upload image...');
    const imageUrl = await uploadImage(file.buffer, file.originalname, 'backgrounds');
    console.log('📸 Image uploaded successfully:', imageUrl);
    
    const imageUpload = new ImageUpload({ imageUrl, message: message || '' });
    await imageUpload.save();
    console.log('📸 Image upload saved to database');

    // Always return a public image URL, never a blob URL
    res.status(201).json({
      ...imageUpload.toObject(),
      backgroundImage: imageUrl // For frontend compatibility
    });
  } catch (error) {
    console.error('📸 Image upload error:', error);
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