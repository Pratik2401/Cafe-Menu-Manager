const Tag = require('../models/TagModel.js');
const mongoose = require('mongoose');
const { adminAuth } = require('../middlewares/adminAuth.js');
const { deleteImage } = require('../utils/imageUploads.js');

/**
 * Create a new tag
 */
const createTag = async (req, res) => {
  try {
    const { name, color, image } = req.body;

    // Validate required fields
    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Tag name is required'
      });
      return;
    }

    // Validate that either color or image is provided
    if (!color && !image) {
      res.status(400).json({
        success: false,
        message: 'Either color or image must be provided'
      });
      return;
    }

    // Check if tag already exists
    const existingTag = await Tag.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingTag) {
      res.status(400).json({
        success: false,
        message: 'Tag with this name already exists'
      });
      return;
    }

    // Create a new tag
    const tagData = { name };
    if (color) tagData.color = color;
    if (image) tagData.image = image;
    
    const newTag = new Tag(tagData);
    await newTag.save();

    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: newTag
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tag',
      error: error.message
    });
  }
};

/**
 * Get all tags
 */
const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tags',
      error: error.message
    });
  }
};

/**
 * Get tag by ID
 */
const getTagById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid tag ID'
      });
      return;
    }
    
    const tag = await Tag.findById(id);
    
    if (!tag) {
      res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: tag
    });
  } catch (error) {
    console.error('Error fetching tag:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tag',
      error: error.message
    });
  }
};

/**
 * Update tag
 */
const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, image } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid tag ID'
      });
      return;
    }
    
    // Check if tag exists
    const tag = await Tag.findById(id);
    if (!tag) {
      res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
      return;
    }
    
    // If name is being changed, check if the new name already exists
    if (name && name !== tag.name) {
      const existingTag = await Tag.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      if (existingTag && existingTag._id instanceof mongoose.Types.ObjectId && existingTag._id.toString() !== id) {
        res.status(400).json({
          success: false,
          message: 'Tag with this name already exists'
        });
        return;
      }
    }
    
    // Update the tag
    const updateData = {};
    if (name) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (image !== undefined) updateData.image = image;
    
    const updatedTag = await Tag.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Tag updated successfully',
      data: updatedTag
    });
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tag',
      error: error.message
    });
  }
};

/**
 * Delete tag
 */
const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid tag ID'
      });
      return;
    }
    
    const tag = await Tag.findById(id);
    
    if (!tag) {
      res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
      return;
    }
    
    // Delete associated image if it exists
    if (tag.image) {
      deleteImage(tag.image);
    }
    
    await Tag.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tag',
      error: error.message
    });
  }
};

/**
 * Toggle tag status
 */
const toggleTagStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid tag ID'
      });
      return;
    }
    
    const tag = await Tag.findById(id);
    
    if (!tag) {
      res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
      return;
    }
    
    // Toggle the isActive status
    const updatedTag = await Tag.findByIdAndUpdate(
      id,
      { $set: { isActive: !tag.isActive } },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: `Tag ${updatedTag?.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedTag
    });
  } catch (error) {
    console.error('Error toggling tag status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle tag status',
      error: error.message
    });
  }
};

module.exports = {
  createTag: createTag,
  getAllTags: getAllTags,
  getTagById: getTagById,
  updateTag: updateTag,
  deleteTag: deleteTag,
  toggleTagStatus: toggleTagStatus
};