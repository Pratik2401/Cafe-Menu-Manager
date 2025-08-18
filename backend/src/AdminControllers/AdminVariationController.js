const Variation = require('../models/VariationModel.js');
const mongoose = require('mongoose');
const { adminAuth } = require('../middlewares/adminAuth.js');

/**
 * Create a new variation
 */
const createVariation = async (req, res) => {
  try {
    const { name, description, isActive, group } = req.body;

    // Validate required fields
    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Variation name is required'
      });
      return;
    }

    // Check if variation already exists in the same group
    const existingVariation = await Variation.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      group: group || 'Default'
    });
    if (existingVariation) {
      res.status(400).json({
        success: false,
        message: 'Variation with this name already exists in this group'
      });
      return;
    }

    // Create a new variation
    const newVariation = new Variation({
      name,
      description: description || '',
      isActive: isActive !== undefined ? isActive : true,
      group: group || 'Default'
    });

    await newVariation.save();

    res.status(201).json({
      success: true,
      message: 'Variation created successfully',
      data: newVariation
    });
  } catch (error) {
    console.error('Error creating variation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create variation',
      error: error.message
    });
  }
};

/**
 * Get all variations
 */
const getAllVariations = async (req, res) => {
  try {
    const variations = await Variation.find().sort({ createdAt: 1 });
    
    res.status(200).json({
      success: true,
      data: variations
    });
  } catch (error) {
    console.error('Error fetching variations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch variations',
      error: error.message
    });
  }
};

/**
 * Get variation by ID
 */
const getVariationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid variation ID'
      });
      return;
    }
    
    const variation = await Variation.findById(id);
    
    if (!variation) {
      res.status(404).json({
        success: false,
        message: 'Variation not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: variation
    });
  } catch (error) {
    console.error('Error fetching variation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch variation',
      error: error.message
    });
  }
};

/**
 * Update variation
 */
const updateVariation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive, group } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid variation ID'
      });
      return;
    }
    
    // Check if variation exists
    const variation = await Variation.findById(id);
    if (!variation) {
      res.status(404).json({
        success: false,
        message: 'Variation not found'
      });
      return;
    }
    
    // If name is being changed, check if the new name already exists in the same group
    if (name && name !== variation.name) {
      const groupToCheck = group !== undefined ? group : variation.group;
      const existingVariation = await Variation.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        group: groupToCheck
      });
      if (existingVariation && existingVariation._id.toString() !== id) {
        res.status(400).json({
          success: false,
          message: 'Variation with this name already exists in this group'
        });
        return;
      }
    }
    
    // Prepare update object
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (group !== undefined) updateData.group = group;
    
    // Update the variation
    const updatedVariation = await Variation.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Variation updated successfully',
      data: updatedVariation
    });
  } catch (error) {
    console.error('Error updating variation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update variation',
      error: error.message
    });
  }
};

/**
 * Delete variation
 */
const deleteVariation = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid variation ID'
      });
      return;
    }
    
    const variation = await Variation.findById(id);
    
    if (!variation) {
      res.status(404).json({
        success: false,
        message: 'Variation not found'
      });
      return;
    }
    
    await Variation.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Variation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting variation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete variation',
      error: error.message
    });
  }
};

/**
 * Toggle variation status
 */
const toggleVariationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid variation ID'
      });
      return;
    }
    
    const variation = await Variation.findById(id);
    
    if (!variation) {
      res.status(404).json({
        success: false,
        message: 'Variation not found'
      });
      return;
    }
    
    // Toggle the isActive status
    const updatedVariation = await Variation.findByIdAndUpdate(
      id,
      { $set: { isActive: !variation.isActive } },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: `Variation ${updatedVariation.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedVariation
    });
  } catch (error) {
    console.error('Error toggling variation status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle variation status',
      error: error.message
    });
  }
};

/**
 * Delete all variations in a group
 */
const deleteVariationGroup = async (req, res) => {
  try {
    const { group } = req.params;
    
    if (!group) {
      res.status(400).json({
        success: false,
        message: 'Group name is required'
      });
      return;
    }
    
    // Find all variations in the group
    const variationsToDelete = await Variation.find({ group: group });
    
    if (variationsToDelete.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No variations found in this group'
      });
      return;
    }
    
    // Delete all variations in the group
    await Variation.deleteMany({ group: group });
    
    res.status(200).json({
      success: true,
      message: `Successfully deleted ${variationsToDelete.length} variations from group "${group}"`,
      deletedCount: variationsToDelete.length
    });
  } catch (error) {
    console.error('Error deleting variation group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete variation group',
      error: error.message
    });
  }
};

module.exports = {
  createVariation,
  getAllVariations,
  getVariationById,
  updateVariation,
  deleteVariation,
  toggleVariationStatus,
  deleteVariationGroup
};