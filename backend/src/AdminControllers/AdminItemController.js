/**
 * @fileoverview Admin Item Controller for TopchiOutpost Cafe Management System
 * 
 * This controller handles all admin operations related to menu items including
 * CRUD operations, image uploads, pricing management, and field visibility controls.
 * It provides comprehensive item management with support for complex pricing structures,
 * variations, add-ons, and bulk operations.
 * 
 * @author TopchiOutpost Development Team
 * @version 1.0.0
 * @since 2025-01-01
 * 
 * @requires ../models/ItemModel.js - Item data model
 * @requires mongoose - MongoDB object modeling
 * @requires ../models/SubCategoryModel.js - SubCategory data model  
 * @requires ../models/TagModel.js - Tag data model
 * @requires ../utils/imageUploads.js - Image upload utilities
 * @requires ../middlewares/adminAuth.js - Admin authentication middleware
 */

const Item = require('../models/ItemModel.js');
const mongoose = require('mongoose');
const SubCategory = require('../models/SubCategoryModel.js');
const Tag = require('../models/TagModel.js');
const { uploadImage, deleteImage } = require('../utils/imageUploads.js');
const { adminAuth } = require('../middlewares/adminAuth.js');

/**
 * Retrieve all items with optional filtering and pagination
 * @route GET /api/admin/items
 * @description Fetches items with support for subcategory filtering, visibility control,
 *              and sorting by serial ID. Includes populated references for subcategory and tags.
 * @access Admin
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.subCategory] - Filter by subcategory ObjectId
 * @param {string} [req.query.show] - Filter by visibility ('true'/'false')
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with items array and status
 * 
 * @example
 * GET /api/admin/items?subCategory=60d5ecb74b24a1001f8b4567&show=true
 * Response: { success: true, data: [{ _id: "...", name: "Coffee", ... }] }
 */
const getAllItems = async (req, res) => {
  try {
    const query = {};  
    
    // Apply subcategory filter if provided and valid
    if (req.query.subCategory && mongoose.Types.ObjectId.isValid(req.query.subCategory)) {
      query.subCategory = req.query.subCategory;
    }
    
    // Apply visibility filter if provided
    if (req.query.show !== undefined) {
      query.show = req.query.show === 'true';
    }
    
    // Fetch items with populated references and sorted by serial ID
    const items = await Item.find(query)
      .populate('subCategory')
      .populate('tags')
      .sort({ serialId: 1 });
      
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Error fetching items' });
  }
};

/**
 * Retrieve a single item by ID
 * @route GET /api/admin/items/:id
 * @description Fetches detailed item information including all relationships
 * @access Admin
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Item ObjectId
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with item data or error message
 * 
 * @example
 * GET /api/admin/items/60d5ecb74b24a1001f8b4567
 * Response: { _id: "...", name: "Cappuccino", price: 4.50, ... }
 */
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid item ID' });
      return;
    }
    
    // Fetch item with populated references
    const item = await Item.findById(id)
      .populate('subCategory')
      .populate('tags');
      
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    
    res.status(200).json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ message: 'Error fetching item' });
  }
};

const createItem = async (req, res) => {
  try {
    const input = req.body;
    const items = Array.isArray(input) ? input : [input];
    const createdItems = [];

    for (let i = 0; i < items.length; i++) {
      const {
        name,
        description,
        price,
        foodCategoryId,
        subcategoryId,
        tagIds,
        addOns,

        show,
      } = items[i];

      if (!name || !price || !subcategoryId) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }

      const foundSubCategory = await SubCategory.findById(subcategoryId);
      if (!foundSubCategory) {
        res.status(400).json({ message: `SubCategory not found: ${subcategoryId}` });
        return;
      }

      // Calculate next serialId for this subCategory
      const lastItem = await Item.findOne({ subCategory: subcategoryId }).sort({ serialId: -1 }).exec();
      const nextSerialId = lastItem ? lastItem.serialId + 1 : 1;

      let imagePath = '';

      // Upload image to server storage if present
      if (req.file && i === 0) {
        imagePath = await uploadImage(
          req.file.buffer,
          req.file.originalname,
          'items'
        );
      } else if (items[i].image) {
        imagePath = items[i].image;
      }

      const itemData = {
        name,
        description,
        price,
        subCategory: foundSubCategory._id,
        addOns: typeof addOns === 'string' ? JSON.parse(addOns || '[]') : (addOns || []),
        serialId: nextSerialId,
        show: show ?? true,
        image: imagePath,
        fieldVisibility: {
          image: true // Always set image visibility to true
        }
      };

         // Handle sizePrices
    if (req.body.sizePrices !== undefined) {
      const sizePrices = typeof req.body.sizePrices === 'string' 
        ? JSON.parse(req.body.sizePrices) 
        : req.body.sizePrices;
      
      if (Array.isArray(sizePrices)) {
        itemData.sizePrices = sizePrices;
      }
    }

    // Handle variations
    if (req.body.variations !== undefined) {
      const variations = typeof req.body.variations === 'string' 
        ? JSON.parse(req.body.variations) 
        : req.body.variations;
      
      if (Array.isArray(variations)) {
        itemData.variations = variations;
      }
    }
    
    if (req.body.hasVariations !== undefined) {
      itemData.hasVariations = req.body.hasVariations === 'true' || req.body.hasVariations === true;
    }


      // Add foodCategory if provided
      if (foodCategoryId) {
        itemData.foodCategory = foodCategoryId;
      }

      // Add tags if provided (up to 2)
      if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
        // Validate tag IDs
        const validTagIds = tagIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
        if (validTagIds.length > 0) {
          // Limit to max 2 tags
          itemData.tags = validTagIds.slice(0, 2);
        }
      }
      
      // Also check for tags field for consistency
      if (items[i].tags && Array.isArray(items[i].tags) && items[i].tags.length > 0) {
        // Validate tag IDs
        const validTagIds = items[i].tags.filter((id) => mongoose.Types.ObjectId.isValid(id));
        if (validTagIds.length > 0) {
          // Limit to max 2 tags
          itemData.tags = validTagIds.slice(0, 2);
        }
      }

      const item = await Item.create(itemData);
      createdItems.push(item);
    }

    res.status(201).json(Array.isArray(input) ? createdItems : createdItems[0]);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Error creating item(s)', details: error.message });
  }
};


/**
 * PUT /api/items/:id
 * Updates fields, handles image update and old image deletion.
 */
const updateItem = async (req, res) => {
  try {
    console.log('Update item request received:', req.params.id);
    console.log('Request body keys:', Object.keys(req.body));
    
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('Invalid item ID:', id);
      res.status(400).json({ message: 'Invalid item ID' });
      return;
    }
    
    const item = await Item.findById(id);
    if (!item) {
      console.log('Item not found:', id);
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    const {
      name,
      description,
      price,
      foodCategory,
      foodCategoryId,
      subCategory,
      tags,
      addOns,
      serialId,
      show,
      image: imageUrl,
      fieldVisibility,

    } = req.body;

    // Update basic fields
    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = Number(price);
    if (foodCategory !== undefined) item.foodCategory = foodCategory;
    if (foodCategoryId !== undefined) item.foodCategory = foodCategoryId;
    if (subCategory !== undefined) item.subCategory = subCategory;
    if (req.body.subcategoryId !== undefined) {
      if (mongoose.Types.ObjectId.isValid(req.body.subcategoryId)) {
        item.subCategory = req.body.subcategoryId;
      }
    }
    
    // Handle tags
    if (tags !== undefined) {
      try {
        const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        if (Array.isArray(parsedTags)) {
          const validTagIds = parsedTags.filter((id) => mongoose.Types.ObjectId.isValid(id));
          item.tags = validTagIds.slice(0, 2);
        }
      } catch (e) {
        console.log('Error parsing tags:', e);
      }
    }
    
    if (req.body.tagIds !== undefined) {
      try {
        const parsedTagIds = typeof req.body.tagIds === 'string' ? JSON.parse(req.body.tagIds) : req.body.tagIds;
        if (Array.isArray(parsedTagIds)) {
          const validTagIds = parsedTagIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
          item.tags = validTagIds.slice(0, 2);
        }
      } catch (e) {
        console.log('Error parsing tagIds:', e);
      }
    }
    
    if (serialId !== undefined) item.serialId = Number(serialId);
    if (show !== undefined) item.show = Boolean(show);


    // Handle addOns
    if (addOns !== undefined) {
      try {
        item.addOns = typeof addOns === 'string' ? JSON.parse(addOns) : addOns;
      } catch (e) {
        console.log('Error parsing addOns:', e);
        item.addOns = [];
      }
    }
    
    // Handle sizePrices
    if (req.body.sizePrices !== undefined) {
      try {
        const sizePrices = typeof req.body.sizePrices === 'string' 
          ? JSON.parse(req.body.sizePrices) 
          : req.body.sizePrices;
        
        if (Array.isArray(sizePrices)) {
          item.sizePrices = sizePrices;
        }
      } catch (e) {
        console.log('Error parsing sizePrices:', e);
      }
    }

    // Handle variations
    if (req.body.variations !== undefined) {
      try {
        const variations = typeof req.body.variations === 'string' 
          ? JSON.parse(req.body.variations) 
          : req.body.variations;
        
        if (Array.isArray(variations)) {
          item.variations = variations;
        }
      } catch (e) {
        console.log('Error parsing variations:', e);
      }
    }
    
    if (req.body.hasVariations !== undefined) {
      item.hasVariations = req.body.hasVariations === 'true' || req.body.hasVariations === true;
    }

    // Handle image
    if (req.file) {
      if (item.image) {
        deleteImage(item.image);
      }
      const newImageUrl = await uploadImage(
        req.file.buffer,
        req.file.originalname,
        'items'
      );
      item.image = newImageUrl;
    } else if (imageUrl !== undefined) {
      item.image = imageUrl === "" ? "" : imageUrl;
    }

    // Handle field visibility
    if (fieldVisibility && typeof fieldVisibility === 'object') {
      try {
        const parsedVisibility = typeof fieldVisibility === 'string' ? JSON.parse(fieldVisibility) : fieldVisibility;
        // Always set image visibility to true
        parsedVisibility.image = true;
        await item.applyFieldVisibilityOverrides(parsedVisibility);
      } catch (e) {
        console.log('Error applying field visibility:', e);
      }
    } else {
      // If no field visibility provided, ensure image is visible
      if (!item.fieldVisibility) {
        item.fieldVisibility = { image: true };
      } else {
        item.fieldVisibility.image = true;
      }
    }
    
    console.log('Saving item...');
    await item.save();
    console.log('Item saved successfully');
    
    res.status(200).json(item);
  } catch (error) {
    console.error('Error updating item - Full error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error updating item', error: error.message });
  }
};

/**
 * DELETE /api/items/:id
 * Deletes item and associated image file
 */
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid item ID' });
      return;
    }

    const item = await Item.findById(id);
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    // Delete associated image
    if (item.image) {
      deleteImage(item.image);
    }

    await Item.findByIdAndDelete(id);
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Error deleting item' });
  }
};

/**
 * PUT /api/items/:id/show
 * Updates the 'show' field to mark availability
 */
const updateItemAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { show } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid item ID' });
      return;
    }
    if (typeof show !== 'boolean') {
      res.status(400).json({ message: "'show' must be boolean" });
      return;
    }

    const item = await Item.findByIdAndUpdate(id, { show }, { new: true });
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    res.status(200).json(item);
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ message: 'Error updating item availability' });
  }
};

/**
 * PUT /api/admin/items/update-serials
 * Accepts an array of {_id, serialId} objects and updates all items' serialIds in bulk.
 */
const updateItemSerials = async (req, res) => {
  try {
    console.log('updateItemSerials endpoint called');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const updates = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      console.log('Invalid request: not an array or empty array');
      res.status(400).json({ error: 'Please provide an array of updates' });
      return;
    }

    console.log(`Processing ${updates.length} updates`);

    // Validate all _ids and serialIds
    for (const { _id, serialId } of updates) {
      if (!mongoose.Types.ObjectId.isValid(_id) || typeof serialId !== 'number' || serialId < 1) {
        console.log('Invalid _id or serialId:', { _id, serialId });
        res.status(400).json({ error: 'Invalid _id or serialId in payload' });
        return;
      }
    }

    // Build bulk operations using _id
    const bulkOps = updates.map(({ _id, serialId }) => ({
      updateOne: {
        filter: { _id },
        update: { serialId }
      }
    }));

    console.log('Executing bulk write operation...');
    const result = await Item.bulkWrite(bulkOps);
    console.log('Bulk write result:', result);

    res.json({ message: 'Items reordered successfully', result });
  } catch (err) {
    console.error('Failed to update item serialIds:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ error: 'Failed to update item serialIds', details: err.message });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  updateItemAvailability,
  updateItemSerials
};