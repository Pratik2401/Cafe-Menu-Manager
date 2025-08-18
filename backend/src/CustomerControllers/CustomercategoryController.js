const Category = require('../models/CategoryModel.js');
const { uploadImage } = require('../utils/imageUploads.js');
const fs = require('fs');
// Get all categories (sorted by serialId)
const Admin = require('../models/AdminModel.js'); // Import the Admin model

const createCategory = async (req, res) => {
  try {
    const { name, serialId, isVisible = true } = req.body;
    const file = req.file;

    if (serialId === undefined) {
      res.status(400).json({ error: 'serialId is required' });
      return;
    }

    if (!file) {
      res.status(400).json({ error: 'Image file is required' });
      return;
    }

    // Upload image to server storage
    const imageUrl = await uploadImage(
      file.buffer,
      file.originalname,
      'categories'
    );

    const category = new Category({ name, image: imageUrl, serialId, isVisible });
    await category.save();

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category', details: err.message });
  }
};

const getAllCategories = async (_req, res) => {
  try {
    // Fetch the admin settings (assuming a single admin setup)
    const admin = await Admin.findOne();
    const allowOrdering = admin ? admin.allowOrdering : true; // Default to true if no admin settings are found

    // Fetch categories that are visible and sort by serialId
    const categories = await Category.find({ isVisible: true }).sort({ serialId: 1 });

    // Add the `orderAllowed` field to the response
    res.json({
      orderAllowed: allowOrdering,
      categories,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch category', details: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, isVisible } = req.body;
    let serialId = req.body.serialId;
    const file = req.file;

    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    if (serialId === undefined || isNaN(Number(serialId))) {
      serialId = existingCategory.serialId;
    } else {
      serialId = Number(serialId);
    }

    let imageUrl = existingCategory.image;
    if (file) {
      // Upload new image to server storage
      imageUrl = await uploadImage(
        file.buffer,
        file.originalname,
        'categories'
      );
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: name ?? existingCategory.name,
        serialId,
        image: imageUrl,
        isVisible: isVisible !== undefined ? isVisible : existingCategory.isVisible
      },
      { new: true }
    );

    res.json(updatedCategory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category', details: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category', details: err.message });
  }
};

const updateCategorySerialId = async (req, res) => {
  try {
    const { serialId } = req.body;
    if (serialId === undefined) {
      res.status(400).json({ error: 'serialId is required' });
      return;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { serialId },
      { new: true }
    );

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update serialId', details: err.message });
  }
};

const toggleCategoryVisibility = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // Toggle the isVisible field
    category.isVisible = !category.isVisible;
    await category.save();

    res.json({
      message: `Category visibility toggled to ${category.isVisible ? 'visible' : 'hidden'}`,
      category
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle visibility', details: err.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  updateCategorySerialId,
  toggleCategoryVisibility
};