const FoodCategory = require('../models/FoodCategoryModel.js');
const { uploadImage, deleteImage } = require('../utils/imageUploads.js');
const { adminAuth } = require('../middlewares/adminAuth.js');

const createFoodCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const file = req.file;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    if (!file) {
      res.status(400).json({ error: 'Icon file is required' });
      return;
    }

    // Upload icon to ImageKit
    const iconUrl = await uploadImage(
      file.buffer || Buffer.from(file.path, 'binary'),
      file.originalname,
      'food-categories'
    );

    // Create new food category
    const foodCategory = new FoodCategory({
      name,
      icon: iconUrl,
      isActive: true
    });

    await foodCategory.save();
    res.status(201).json(foodCategory);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'A food category with this name already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create food category', details: err.message });
  }
};

const getAllFoodCategories = async (_req, res) => {
  try {
    const foodCategories = await FoodCategory.find().sort({ createdAt: -1 });
    res.json(foodCategories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch food categories', details: err.message });
  }
};

const getFoodCategoryById = async (req, res) => {
  try {
    const foodCategory = await FoodCategory.findById(req.params.id);
    if (!foodCategory) {
      res.status(404).json({ error: 'Food category not found' });
      return;
    }
    res.json(foodCategory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch food category', details: err.message });
  }
};

const updateFoodCategory = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const file = req.file;

    const existingCategory = await FoodCategory.findById(req.params.id);
    if (!existingCategory) {
      res.status(404).json({ error: 'Food category not found' });
      return;
    }

    let iconUrl = existingCategory.icon;

    if (file) {
      // Delete old icon if it exists
      if (existingCategory.icon) {
        deleteImage(existingCategory.icon);
      }
      // Upload new icon to ImageKit
      iconUrl = await uploadImage(
        file.buffer || Buffer.from(file.path, 'binary'),
        file.originalname,
        'food-categories'
      );
    }

    // Update food category
    const updatedCategory = await FoodCategory.findByIdAndUpdate(
      req.params.id,
      {
        name: name || existingCategory.name,
        icon: iconUrl,
        isActive: isActive !== undefined ? isActive : existingCategory.isActive
      },
      { new: true }
    );

    res.json(updatedCategory);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'A food category with this name already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to update food category', details: err.message });
  }
};

const deleteFoodCategory = async (req, res) => {
  try {
    const foodCategory = await FoodCategory.findById(req.params.id);
    if (!foodCategory) {
      res.status(404).json({ error: 'Food category not found' });
      return;
    }
    
    // Delete associated icon
    if (foodCategory.icon) {
      deleteImage(foodCategory.icon);
    }
    
    await FoodCategory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Food category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete food category', details: err.message });
  }
};

const toggleFoodCategoryStatus = async (req, res) => {
  try {
    const foodCategory = await FoodCategory.findById(req.params.id);

    if (!foodCategory) {
      res.status(404).json({ error: 'Food category not found' });
      return;
    }

    // Toggle the isActive field
    foodCategory.isActive = !foodCategory.isActive;
    await foodCategory.save();

    res.json({
      message: `Food category status toggled to ${foodCategory.isActive ? 'active' : 'inactive'}`,
      foodCategory
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle food category status', details: err.message });
  }
};
module.exports = {
  createFoodCategory: createFoodCategory,
  getAllFoodCategories: getAllFoodCategories,
  getFoodCategoryById: getFoodCategoryById,
  updateFoodCategory: updateFoodCategory,
  deleteFoodCategory: deleteFoodCategory,
  toggleFoodCategoryStatus: toggleFoodCategoryStatus
};