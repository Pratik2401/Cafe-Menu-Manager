const Allergy = require('../models/AllergyModel.js');
const mongoose = require('mongoose');
const { uploadImage, deleteImage } = require('../utils/imageUploads.js');
const { adminAuth } = require('../middlewares/adminAuth.js');

/**
 * Create a new allergy
 */
const createAllergy = async (req, res) => {
  try {
    const { name } = req.body;
    const file = req.file;

    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Allergy name is required'
      });
      return;
    }

    if (!file) {
      res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
      return;
    }

    // Check if allergy already exists
    const existingAllergy = await Allergy.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingAllergy) {
      res.status(400).json({
        success: false,
        message: 'Allergy with this name already exists'
      });
      return;
    }

    // Upload image
    const imageUrl = await uploadImage(
      file.buffer,
      file.originalname,
      'allergies'
    );

    // Create new allergy
    const newAllergy = new Allergy({
      name,
      image: imageUrl,
      isActive: true
    });

    await newAllergy.save();

    res.status(201).json({
      success: true,
      message: 'Allergy created successfully',
      data: newAllergy
    });
  } catch (error) {
    console.error('Error creating allergy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create allergy',
      error: error.message
    });
  }
};

/**
 * Get all allergies
 */
const getAllAllergies = async (req, res) => {
  try {
    const allergies = await Allergy.find().sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      data: allergies
    });
  } catch (error) {
    console.error('Error fetching allergies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch allergies',
      error: error.message
    });
  }
};

/**
 * Get allergy by ID
 */
const getAllergyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid allergy ID'
      });
      return;
    }
    
    const allergy = await Allergy.findById(id);
    
    if (!allergy) {
      res.status(404).json({
        success: false,
        message: 'Allergy not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: allergy
    });
  } catch (error) {
    console.error('Error fetching allergy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch allergy',
      error: error.message
    });
  }
};

/**
 * Update allergy
 */
const updateAllergy = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const file = req.file;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid allergy ID'
      });
      return;
    }
    
    // Check if allergy exists
    const allergy = await Allergy.findById(id);
    if (!allergy) {
      res.status(404).json({
        success: false,
        message: 'Allergy not found'
      });
      return;
    }
    
    // If name is being changed, check if the new name already exists
    if (name && name !== allergy.name) {
      const existingAllergy = await Allergy.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      if (existingAllergy && existingAllergy._id.toString() !== id) {
        res.status(400).json({
          success: false,
          message: 'Allergy with this name already exists'
        });
        return;
      }
    }
    
    // Prepare update object
    const updateData = {};
    if (name) updateData.name = name;
    
    // Handle image upload if provided
    if (file) {
      // Delete old image if it exists
      if (allergy.image) {
        deleteImage(allergy.image);
      }
      const imageUrl = await uploadImage(
        file.buffer,
        file.originalname,
        'allergies'
      );
      updateData.image = imageUrl;
    }
    
    // Update the allergy
    const updatedAllergy = await Allergy.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Allergy updated successfully',
      data: updatedAllergy
    });
  } catch (error) {
    console.error('Error updating allergy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update allergy',
      error: error.message
    });
  }
};

/**
 * Delete allergy
 */
const deleteAllergy = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid allergy ID'
      });
      return;
    }
    
    const allergy = await Allergy.findById(id);
    
    if (!allergy) {
      res.status(404).json({
        success: false,
        message: 'Allergy not found'
      });
      return;
    }
    
    // Delete associated image
    if (allergy.image) {
      deleteImage(allergy.image);
    }
    
    await Allergy.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Allergy deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting allergy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete allergy',
      error: error.message
    });
  }
};

/**
 * Toggle allergy status
 */
const toggleAllergyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid allergy ID'
      });
      return;
    }
    
    const allergy = await Allergy.findById(id);
    
    if (!allergy) {
      res.status(404).json({
        success: false,
        message: 'Allergy not found'
      });
      return;
    }
    
    // Toggle the isActive status
    const updatedAllergy = await Allergy.findByIdAndUpdate(
      id,
      { $set: { isActive: !allergy.isActive } },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: `Allergy ${updatedAllergy.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedAllergy
    });
  } catch (error) {
    console.error('Error toggling allergy status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle allergy status',
      error: error.message
    });
  }
};

module.exports = {
  createAllergy,
  getAllAllergies,
  getAllergyById,
  updateAllergy,
  deleteAllergy,
  toggleAllergyStatus
};