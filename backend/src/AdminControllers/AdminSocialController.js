const Social = require('../models/SocialModel.js');
const mongoose = require('mongoose');
const { adminAuth } = require('../middlewares/adminAuth.js');
const { deleteImage } = require('../utils/imageUploads.js');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fs = require('fs');
    const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
    const dir = path.join(uploadsDir, 'social-images');
    
    console.log(`Upload directory: ${uploadsDir}`);
    console.log(`Target directory: ${dir}`);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Directory created: ${dir}`);
      } catch (err) {
        console.error(`Error creating directory: ${err.message}`);
        return cb(err);
      }
    }
    
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'social-' + uniqueSuffix + path.extname(file.originalname);
    console.log(`Generated filename: ${filename}`);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    console.log('File filter - mimetype:', file.mimetype, 'originalname:', file.originalname);
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  onError: function (err, next) {
    console.error('Multer error:', err);
    next(err);
  }
});

/**
 * Create a new social link
 */
const createSocial = async (req, res) => {
  try {
    console.log('=== CREATE SOCIAL REQUEST ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('File:', req.file);
    console.log('=============================');
    
    const { name, url, isVisible } = req.body;

    console.log('Creating social with:', { 
      name, 
      url, 
      isVisible, 
      hasFile: !!req.file,
      fileName: req.file?.filename,
      filePath: req.file?.path,
      fileSize: req.file?.size,
      contentType: req.headers['content-type']
    });

    // Validate required fields
    if (!name || !url) {
      res.status(400).json({
        success: false,
        message: 'Name and URL are required'
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Icon image is required'
      });
      return;
    }

    // Check if we already have 6 social media entries
    const socialCount = await Social.countDocuments();
    if (socialCount >= 6) {
      res.status(400).json({
        success: false,
        message: 'Maximum 6 social media entries allowed'
      });
      return;
    }

    // Get next serial ID
    const maxSerial = await Social.findOne().sort({ serialId: -1 });
    const nextSerialId = maxSerial ? maxSerial.serialId + 1 : 1;

    // Create a new social link
    const iconPath = `/uploads/social-images/${req.file.filename}`;
    console.log('Icon path being saved:', iconPath);
    
    const newSocial = new Social({
      name: name.trim(),
      url: url.trim(),
      icon: iconPath,
      isVisible: isVisible !== undefined ? isVisible : true,
      serialId: nextSerialId
    });

    await newSocial.save();

    res.status(201).json({
      success: true,
      message: 'Social media created successfully',
      data: newSocial
    });
  } catch (error) {
    console.error('Error creating social media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create social media',
      error: error.message
    });
  }
};

/**
 * Get all social links
 */
const getAllSocials = async (req, res) => {
  try {
    const socials = await Social.find().sort({ serialId: 1 });
    
    res.status(200).json({
      success: true,
      data: socials
    });
  } catch (error) {
    console.error('Error fetching social links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social links',
      error: error.message
    });
  }
};

/**
 * Get social link by ID
 */
const getSocialById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid social link ID'
      });
      return;
    }
    
    const social = await Social.findById(id);
    
    if (!social) {
      res.status(404).json({
        success: false,
        message: 'Social link not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: social
    });
  } catch (error) {
    console.error('Error fetching social link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social link',
      error: error.message
    });
  }
};

/**
 * Update social link
 */
const updateSocial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, isVisible } = req.body;
    
    console.log('Updating social with:', { 
      id,
      name, 
      url, 
      isVisible, 
      hasFile: !!req.file,
      contentType: req.headers['content-type']
    });
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid social media ID'
      });
      return;
    }
    
    // Check if social link exists
    const social = await Social.findById(id);
    if (!social) {
      res.status(404).json({
        success: false,
        message: 'Social media not found'
      });
      return;
    }
    
    // Handle icon update
    let icon = social.icon; // Keep existing icon by default
    if (req.file) {
      try {
        // Delete old icon if exists
        if (social.icon) {
          try {
            await deleteImage(social.icon);
          } catch (deleteError) {
            console.warn('Failed to delete old icon:', deleteError);
          }
        }
        icon = `/uploads/social-images/${req.file.filename}`;
        console.log('Updated icon path:', icon);
      } catch (imageError) {
        console.error('Error processing icon:', imageError);
      }
    }
    
    // Update the social link
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (url !== undefined) updateData.url = url.trim();
    if (isVisible !== undefined) updateData.isVisible = isVisible;
    if (icon !== social.icon) updateData.icon = icon;
    
    console.log('Update data:', updateData);
    
    const updatedSocial = await Social.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Social media updated successfully',
      data: updatedSocial
    });
  } catch (error) {
    console.error('Error updating social media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update social media',
      error: error.message
    });
  }
};

/**
 * Delete social link
 */
const deleteSocial = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid social media ID'
      });
      return;
    }
    
    const social = await Social.findById(id);
    
    if (!social) {
      res.status(404).json({
        success: false,
        message: 'Social media not found'
      });
      return;
    }
    
    // Delete icon if exists
    if (social.icon) {
      try {
        await deleteImage(social.icon);
      } catch (deleteError) {
        console.warn('Failed to delete icon:', deleteError);
      }
    }
    
    await Social.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Social media deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting social media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete social media',
      error: error.message
    });
  }
};

/**
 * Toggle social link visibility
 */
const toggleSocialVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVisible } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid social media ID'
      });
      return;
    }
    
    if (typeof isVisible !== 'boolean') {
      res.status(400).json({
        success: false,
        message: 'isVisible must be a boolean value'
      });
      return;
    }
    
    const social = await Social.findById(id);
    
    if (!social) {
      res.status(404).json({
        success: false,
        message: 'Social media not found'
      });
      return;
    }
    
    const updatedSocial = await Social.findByIdAndUpdate(
      id,
      { $set: { isVisible } },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: `Social media ${isVisible ? 'shown' : 'hidden'} successfully`,
      data: updatedSocial
    });
  } catch (error) {
    console.error('Error toggling social media visibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle social media visibility',
      error: error.message
    });
  }
};

/**
 * Update social media serial order
 */
const updateSocialSerials = async (req, res) => {
  try {
    const { socials } = req.body;
    
    if (!Array.isArray(socials)) {
      res.status(400).json({
        success: false,
        message: 'Socials must be an array'
      });
      return;
    }
    
    // Update each social media's serial ID
    const updatePromises = socials.map(({ _id, serialId }) => 
      Social.findByIdAndUpdate(_id, { serialId }, { new: true })
    );
    
    await Promise.all(updatePromises);
    
    res.status(200).json({
      success: true,
      message: 'Social media order updated successfully'
    });
  } catch (error) {
    console.error('Error updating social media order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update social media order',
      error: error.message
    });
  }
};

module.exports = {
  createSocial,
  getAllSocials,
  getSocialById,
  updateSocial,
  deleteSocial,
  toggleSocialVisibility,
  updateSocialSerials,
  upload
};