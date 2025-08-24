const Category = require('../models/CategoryModel.js');
const { uploadImage, deleteImage } = require('../utils/imageUploads.js');
const imagekit = require('../config/imagekit.js');
const { adminAuth } = require('../middlewares/adminAuth.js');
const { cache } = require('../config/cache.js');

// Fallback upload function using ImageKit
const uploadImageWithFallback = async (fileBuffer, fileName, folder) => {
  try {
    // Try local upload first
    return await uploadImage(fileBuffer, fileName, folder);
  } catch (error) {
    console.log('Local upload failed, trying ImageKit:', error.message);
    // Fallback to ImageKit
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: `${Date.now()}-${fileName}`,
      folder: `/${folder}`,
    });
    return response.url;
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, serialId, isVisible = true, isAgeRestricted = false } = req.body;
    const file = req.file;

    if (serialId === undefined) {
      res.status(400).json({ error: 'serialId is required' });
      return;
    }

    if (!file) {
      res.status(400).json({ error: 'Image file is required' });
      return;
    }

    // Upload image with fallback
    const imageUrl = await uploadImageWithFallback(
      file.buffer,
      file.originalname,
      'categories'
    );

    const category = new Category({ name, image: imageUrl, serialId, isVisible, isAgeRestricted });
    await category.save();

    // Invalidate menu cache after creating category
    await cache.clearPattern('menu:*');

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category', details: err.message });
  }
};

// Get all categories (sorted by serialId)
const getAllCategories = async (_req, res) => {
  try {
    const categories = await Category.find().sort({ serialId: 1 });
    res.json(categories);
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
    const { name, isVisible, isAgeRestricted } = req.body;
    let serialId = req.body.serialId;
    const file = req.file;

    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // Validate or fallback serialId
    if (serialId === undefined || isNaN(Number(serialId))) {
      serialId = existingCategory.serialId;
    } else {
      serialId = Number(serialId);
    }

    let imageUrl = existingCategory.image;

    if (file) {
      try {
        // Delete old image if it exists
        if (existingCategory.image) {
          await deleteImage(existingCategory.image);
        }
        // Upload new image with fallback
        imageUrl = await uploadImageWithFallback(
          file.buffer,
          file.originalname,
          'categories'
        );
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        // Continue with update but keep existing image
        console.log('Continuing with existing image due to upload failure');
      }
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: name ?? existingCategory.name,
        serialId,
        image: imageUrl,
        isVisible: isVisible !== undefined ? isVisible : existingCategory.isVisible,
        isAgeRestricted: isAgeRestricted !== undefined ? isAgeRestricted : existingCategory.isAgeRestricted,
      },
      { new: true }
    );

    // Invalidate menu cache after updating category
    await cache.clearPattern('menu:*');

    res.json(updatedCategory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category', details: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    // Find the category first to check if it exists
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // Delete category image
    if (category.image) {
      deleteImage(category.image);
    }

    // Find all subcategories belonging to this category
    const SubCategory = require('../models/SubCategoryModel.js');
    const Item = require('../models/ItemModel.js');
    
    // Get all subcategories of this category
    const subcategories = await SubCategory.find({ category: req.params.id });
    
    // Get all subcategory IDs
    const subcategoryIds = subcategories.map((subcat) => subcat._id);
    
    // Delete all items belonging to these subcategories
    if (subcategoryIds.length > 0) {
      await Item.deleteMany({ subCategory: { $in: subcategoryIds } });
    }
    
    // Delete all subcategories belonging to this category
    await SubCategory.deleteMany({ category: req.params.id });
    
    // Finally delete the category itself
    await Category.findByIdAndDelete(req.params.id);
    
    // Invalidate menu cache after deleting category
    await cache.clearPattern('menu:*');
    
    res.json({ 
      message: 'Category deleted successfully',
      deletedSubcategories: subcategories.length,
      deletedItems: subcategoryIds.length > 0 ? 'All related items' : 'None'
    });
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

    // Invalidate menu cache after updating serial ID
    await cache.clearPattern('menu:*');
    
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

    // Invalidate menu cache after toggling visibility
    await cache.clearPattern('menu:*');
    
    res.json({
      message: `Category visibility toggled to ${category.isVisible ? 'visible' : 'hidden'}`,
      category,
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