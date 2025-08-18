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
    const dir = 'uploads/social-images/';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Directory created: ${dir}`);
      } catch (err) {
        console.error(`Error creating directory: ${err.message}`);
      }
    }
    
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'social-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * Create a new social link
 */
const createSocial = async (req, res) => {
  try {
    // Handle both FormData and JSON requests
    const platform = req.body.platform;
    const url = req.body.url;
    const isVisible = req.body.isVisible;
    const cafeName = req.body.cafeName;
    const location = req.body.location;

    console.log('Creating social with:', { 
      platform, 
      url, 
      isVisible, 
      cafeName, 
      hasFile: !!req.file,
      contentType: req.headers['content-type']
    });

    // Validate required fields
    if (!platform || !cafeName) {
      res.status(400).json({
        success: false,
        message: 'Platform and cafeName are required'
      });
      return;
    }

    // Check if social link already exists for this platform
    const existingSocial = await Social.findOne({ platform });
    if (existingSocial) {
      res.status(400).json({
        success: false,
        message: `Social link for ${platform} already exists`
      });
      return;
    }

    // Handle custom image for Website platform
    let customImage = null;
    if (req.file && platform === 'Website') {
      customImage = `/uploads/social-images/${req.file.filename}`;
      console.log('Custom image path:', customImage);
    }

    // Create a new social link
    const newSocial = new Social({
      platform,
      url: url || '',
      cafeName,
      isVisible: isVisible !== undefined ? isVisible : true,
      location: location || {},
      customImage
    });

    await newSocial.save();

    res.status(201).json({
      success: true,
      message: 'Social link created successfully',
      data: newSocial
    });
  } catch (error) {
    console.error('Error creating social link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create social link',
      error: error.message
    });
  }
};

/**
 * Get all social links
 */
const getAllSocials = async (req, res) => {
  try {
    const socials = await Social.find().sort({ platform: 1 });
    
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
    const { platform, url, isVisible, cafeName, location } = req.body;
    
    console.log('Updating social with:', { 
      id,
      platform, 
      url, 
      isVisible, 
      cafeName, 
      hasFile: !!req.file,
      contentType: req.headers['content-type']
    });
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid social link ID'
      });
      return;
    }
    
    // Check if social link exists
    const social = await Social.findById(id);
    if (!social) {
      res.status(404).json({
        success: false,
        message: 'Social link not found'
      });
      return;
    }
    
    // If platform is being changed, check if the new platform already exists
    if (platform && platform !== social.platform) {
      const existingSocial = await Social.findOne({ platform });
      if (existingSocial && existingSocial._id.toString() !== id) {
        res.status(400).json({
          success: false,
          message: `Social link for ${platform} already exists`
        });
        return;
      }
    }
    
    // Handle custom image update for Website platform
    let customImage = social.customImage; // Keep existing image by default
    if (req.file && (platform === 'Website' || social.platform === 'Website')) {
      try {
        // Delete old image if exists
        if (social.customImage) {
          try {
            await deleteImage(social.customImage);
          } catch (deleteError) {
            console.warn('Failed to delete old image:', deleteError);
            // Continue with the update even if delete fails
          }
        }
        customImage = `/uploads/social-images/${req.file.filename}`;
        console.log('Updated custom image path:', customImage);
      } catch (imageError) {
        console.error('Error processing image:', imageError);
        // Continue with the update without changing the image
      }
    }
    
    // Update the social link
    const updateData = {};
    if (platform) updateData.platform = platform;
    if (url !== undefined) updateData.url = url; // Allow empty string URLs
    if (cafeName) updateData.cafeName = cafeName;
    if (isVisible !== undefined) updateData.isVisible = isVisible;
    if (location) updateData.location = location;
    if (customImage !== social.customImage) updateData.customImage = customImage;
    
    console.log('Update data:', updateData);
    
    const updatedSocial = await Social.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Social link updated successfully',
      data: updatedSocial
    });
  } catch (error) {
    console.error('Error updating social link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update social link',
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
    
    // Delete custom image if exists
    if (social.customImage) {
      try {
        await deleteImage(social.customImage);
      } catch (deleteError) {
        console.warn('Failed to delete custom image:', deleteError);
      }
    }
    
    await Social.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Social link deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting social link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete social link',
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
        message: 'Invalid social link ID'
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
        message: 'Social link not found'
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
      message: `Social link ${isVisible ? 'shown' : 'hidden'} successfully`,
      data: updatedSocial
    });
  } catch (error) {
    console.error('Error toggling social link visibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle social link visibility',
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
  upload
};