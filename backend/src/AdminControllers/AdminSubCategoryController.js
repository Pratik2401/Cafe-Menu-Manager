const SubCategory = require('../models/SubCategoryModel.js');
const Category = require('../models/CategoryModel.js');
const Item = require('../models/ItemModel.js');
const mongoose = require('mongoose');
const { adminAuth } = require('../middlewares/adminAuth.js');
const { deleteImage } = require('../utils/imageUploads.js');
const { cache } = require('../config/cache.js');

// Helper to get fieldVisibility with defaults
const defaultFieldVisibility = {
  description: true,
  image: true,
  allergens: true,
  addOns: true,
  rating: true,
  createdAt: true,
};

// Create multiple subcategories
const createSubCategory = async (req, res) => {
  try {
    const subCategories = req.body; // Expecting array of subcategory objects

    if (!Array.isArray(subCategories) || subCategories.length === 0) {
      res.status(400).json({ error: 'Please provide an array of subcategories' });
      return;
    }

    for (const subCategoryData of subCategories) {
      const { name, category, isVisible = true, fieldVisibility = {}, taxType = 'GST', taxRate = null, notes = [] } = subCategoryData;

      // Validate category existence
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        res.status(400).json({ error: `Invalid category ID for subcategory: ${name}` });
        return;
      }

      // Find the max serialId in this category
      const lastSubCategory = await SubCategory
        .find({ category })
        .sort({ serialId: -1 })
        .limit(1)
        .exec();

      let nextSerialId = 1;
      if (lastSubCategory.length > 0) {
        nextSerialId = lastSubCategory[0].serialId + 1;
      }

      // Merge fieldVisibility with defaults
      const finalFieldVisibility = {
        ...defaultFieldVisibility,
        ...fieldVisibility,
      };

      const subCategory = new SubCategory({
        name,
        category,
        serialId: nextSerialId,
        isVisible,
        taxType,
        taxRate,
        notes,
        fieldVisibility: finalFieldVisibility,
      });

      await subCategory.save();
    }

    // Invalidate menu cache after creating subcategories
    await cache.clearPattern('menu:*');
    
    res.status(201).json({ message: 'Subcategories created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create subcategories', details: err.message });
  }
};

// Get all subcategories (sorted by serialId)
const getAllSubCategories = async (_req, res) => {
  try {
    const subCategories = await SubCategory.find()
      .sort({ serialId: 1 })
      .populate('category')
      .select('-__v'); // optional: exclude version key
    res.json(subCategories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subcategories', details: err.message });
  }
};

const getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id).populate('category');
    if (!subCategory) {
      res.status(404).json({ error: 'Subcategory not found' });
      return;
    }
    res.json(subCategory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subcategory', details: err.message });
  }
};

const updateSubCategory = async (req, res) => {
  try {
    const { name, category, serialId: newSerialId, isVisible, fieldVisibility, taxType, taxRate, notes } = req.body;
    const subCategoryId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
      res.status(400).json({ error: 'Invalid subcategory ID' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      res.status(400).json({ error: 'Invalid category ID' });
      return;
    }

    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const existingSubCategory = await SubCategory.findById(subCategoryId);
    if (!existingSubCategory) {
      res.status(404).json({ error: 'Subcategory not found' });
      return;
    }

    let finalSerialId = newSerialId;

    // If category changed, reset serialId in new category
    if (existingSubCategory.category.toString() !== category) {
      const lastSubCategoryInNewCategory = await SubCategory
        .find({ category })
        .sort({ serialId: -1 })
        .limit(1)
        .exec();

      finalSerialId = lastSubCategoryInNewCategory.length > 0 ? lastSubCategoryInNewCategory[0].serialId + 1 : 1;
    }

    // Merge new visibility with default, fallback to existing if not provided
    let finalFieldVisibility = existingSubCategory.fieldVisibility;
    if (fieldVisibility && typeof fieldVisibility === 'object') {
      finalFieldVisibility = {
        ...defaultFieldVisibility,
        ...fieldVisibility,
      };
    }

    const updatedData = {
      name,
      category,
      serialId: finalSerialId,
      fieldVisibility: finalFieldVisibility,
    };

    if (typeof isVisible === 'boolean') {
      updatedData.isVisible = isVisible;
    }
    
    // Handle tax type and rate update
    if (taxType !== undefined) {
      updatedData.taxType = taxType;
    }
    
    if (taxRate !== undefined) {
      updatedData.taxRate = taxRate;
    }
    
    // Handle notes update
    if (notes !== undefined) {
      updatedData.notes = notes;
    }

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      subCategoryId,
      updatedData,
      { new: true }
    );

    if (!updatedSubCategory) {
      res.status(500).json({ error: 'Failed to update subcategory after update' });
      return;
    }

    // BULK update: Sync fieldVisibility of all related items in one operation
    await Item.updateMany(
      { subCategory: subCategoryId },
      { $set: { fieldVisibility: updatedSubCategory.fieldVisibility } }
    );

    // Invalidate menu cache after updating subcategory
    await cache.clearPattern('menu:*');
    
    res.json(updatedSubCategory);
  } catch (err) {
    console.error('Failed to update subcategory:', err.message);
    res.status(500).json({
      error: 'Failed to update subcategory',
      details: err.message,
    });
  }
};

const deleteSubCategory = async (req, res) => {
  try {
    // Find the subcategory first to check if it exists
    const subCategory = await SubCategory.findById(req.params.id);
    if (!subCategory) {
      res.status(404).json({ error: 'Subcategory not found' });
      return;
    }
    
    // Delete images of all items belonging to this subcategory
    const items = await Item.find({ subCategory: req.params.id });
    items.forEach(item => {
      if (item.image) {
        deleteImage(item.image);
      }
    });
    
    // Delete all items belonging to this subcategory
    const deleteItemsResult = await Item.deleteMany({ subCategory: req.params.id });
    
    // Delete the subcategory itself
    await SubCategory.findByIdAndDelete(req.params.id);
    
    // Invalidate menu cache after deleting subcategory
    await cache.clearPattern('menu:*');
    
    res.json({ 
      message: 'Subcategory deleted successfully',
      deletedItems: deleteItemsResult.deletedCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete subcategory', details: err.message });
  }
};

const getSubCategoriesByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      res.status(400).json({ error: 'Invalid category ID' });
      return;
    }

    // Fetch subcategories from the database
    const subCategoriesWithCounts = await SubCategory.aggregate([
      {
        $match: {
          category: new mongoose.Types.ObjectId(categoryId),
        },
      },
      {
        $sort: { serialId: 1 },
      },
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: 'subCategory',
          as: 'items',
        },
      },
      {
        $addFields: {
          count: { $size: '$items' },
        },
      },
      {
        $project: {
          items: 0,
        },
      },
    ]);

    res.json({
      count: subCategoriesWithCounts.length,
      items: subCategoriesWithCounts,
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch subcategories for category',
      details: err.message,
    });
  }
};

// Toggle visibility of a subcategory
const toggleSubCategoryVisibility = async (req, res) => {
  try {
    const { isVisible } = req.body;

    if (typeof isVisible !== 'boolean') {
      res.status(400).json({ error: 'Invalid isVisible value. It must be a boolean.' });
      return;
    }

    const subCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      { isVisible },
      { new: true }
    );

    if (!subCategory) {
      res.status(404).json({ error: 'Subcategory not found' });
      return;
    }

    // Invalidate menu cache after toggling visibility
    await cache.clearPattern('menu:*');
    
    res.json({
      message: 'Subcategory visibility updated successfully',
      subCategory,
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to toggle subcategory visibility',
      details: err.message,
    });
  }
};

const updateSubCategorySerialId = async (req, res) => {
  try {
    const { serialId } = req.body; // New serialId to assign
    const subCategoryId = req.params.id;

    // Validate subcategory ID
    if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
      res.status(400).json({ error: 'Invalid subcategory ID' });
      return;
    }

    // Validate serialId
    if (typeof serialId !== 'number' || serialId < 1) {
      res.status(400).json({ error: 'Invalid serialId. It must be a positive number.' });
      return;
    }

    // Find the subcategory to update
    const subCategory = await SubCategory.findById(subCategoryId);
    if (!subCategory) {
      res.status(404).json({ error: 'Subcategory not found' });
      return;
    }

    const currentSerialId = subCategory.serialId;
    const categoryId = subCategory.category;

    // If the serialId is unchanged, return early
    if (currentSerialId === serialId) {
      res.status(200).json({ message: 'No change in serialId required', subCategory });
      return;
    }

    // Fetch all subcategories in the same category, sorted by serialId
    const allSubCategories = await SubCategory.find({ category: categoryId }).sort({ serialId: 1 });

    // Remove the current subcategory from the list
    const filteredSubCategories = allSubCategories.filter(
      (subCat) => subCat._id.toString() !== subCategoryId
    );

    // Insert the subcategory at the new position
    const reorderedSubCategories = [];
    let inserted = false;

    for (let i = 0; i <= filteredSubCategories.length; i++) {
      if (i + 1 === serialId && !inserted) {
        reorderedSubCategories.push(subCategory); // Insert the subcategory at the new position
        inserted = true;
      }
      if (i < filteredSubCategories.length) {
        reorderedSubCategories.push(filteredSubCategories[i]);
      }
    }

    // Reassign serialIds to all subcategories
    const bulkOps = reorderedSubCategories.map((subCat, index) => ({
      updateOne: {
        filter: { _id: subCat._id },
        update: { serialId: index + 1 },
      },
    }));

    // Perform bulk update
    await SubCategory.bulkWrite(bulkOps);

    // Fetch the updated subcategory
    const updatedSubCategory = await SubCategory.findById(subCategoryId);

    // Invalidate menu cache after updating serial ID
    await cache.clearPattern('menu:*');
    
    res.json({
      message: 'Subcategory serialId updated and reordered successfully',
      subCategory: updatedSubCategory,
    });
  } catch (err) {
    console.error('Failed to update serialId of subcategory:', err.message);
    res.status(500).json({
      error: 'Failed to update serialId of subcategory',
      details: err.message,
    });
  }
};
module.exports = {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  getSubCategoriesByCategoryId,
  toggleSubCategoryVisibility,
  updateSubCategorySerialId
};