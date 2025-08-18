const Variation = require('../models/VariationModel.js');

/**
 * Get all active variations
 */
const getAllVariations = async (req, res) => {
  try {
    // Only return active variations
    const variations = await Variation.find({ isActive: true }).sort({ name: 1 });
    
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
    
    const variation = await Variation.findOne({ 
      _id: id,
      isActive: true 
    });
    
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

module.exports = {
  getAllVariations,
  getVariationById
};