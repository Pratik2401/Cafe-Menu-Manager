const Allergy = require('../models/AllergyModel.js');

/**
 * Get all active allergies
 */
const getAllAllergies = async (req, res) => {
  try {
    // Only return active allergies
    const allergies = await Allergy.find({ isActive: true }).sort({ name: 1 });
    
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
    
    const allergy = await Allergy.findOne({ 
      _id: id,
      isActive: true 
    });
    
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

module.exports = {
  getAllAllergies,
  getAllergyById
};