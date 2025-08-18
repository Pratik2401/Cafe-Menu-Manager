const SubCategory = require('../models/SubCategoryModel');
const Category = require('../models/CategoryModel');

const getAllSubCategories = async (_req, res) => {
  try {
    const subCategories = await SubCategory.find({ isVisible: true })
      .sort({ serialId: 1 }) 
      .populate('category');
    res.json(subCategories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subcategories', details: err.message });
  }
};

const getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findOne({ _id: req.params.id, isVisible: true }).populate('category');
    if (!subCategory) {
      res.status(404).json({ error: 'Subcategory not found or not visible' });
      return;
    }
    res.json(subCategory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subcategory', details: err.message });
  }
};

module.exports = {
  getAllSubCategories,
  getSubCategoryById
};
