const FoodCategory = require('../models/FoodCategoryModel.js');

const getAllFoodCategories = async (_req, res) => {
  try {
    // Only return active food categories
    const foodCategories = await FoodCategory.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(foodCategories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch food categories', details: err.message });
  }
};

const getFoodCategoryById = async (req, res) => {
  try {
    const foodCategory = await FoodCategory.findOne({ 
      _id: req.params.id,
      isActive: true 
    });
    
    if (!foodCategory) {
      res.status(404).json({ error: 'Food category not found' });
      return;
    }
    
    res.json(foodCategory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch food category', details: err.message });
  }
};

module.exports = {
  getAllFoodCategories,
  getFoodCategoryById
};