const Item = require('../models/ItemModel.js');
const fs = require('fs');
const path = require('path');

/**
 * Get all items (with optional filtering)
 */
const getAllItems = async (req, res) => {
  try {
    const { subCategory, isVeg, available, cafeSpeciality, category, serialId, show } = req.query;
    const query = {};

    // Only filter by show if explicitly provided, otherwise show all items
    if (show !== undefined) {
      query.show = show === 'true';
    }

    if (subCategory) query.subCategory = subCategory;
    if (isVeg) query.isVeg = isVeg === 'true';
    if (available) query.available = available === 'true';
    if (cafeSpeciality) query.cafeSpeciality = cafeSpeciality === 'true';
    if (category) query.category = category;
    if (serialId) query.serialId = serialId;

    const items = await Item.find(query).populate({
      path: 'subCategory',
      select: 'name gstRate fieldVisibility'
    }).populate('tags').sort({ serialId: 1 });

    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Error fetching items' });
  }
};

/**
 * Get a single item by its ID
 */
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id)
      .populate({
        path: 'subCategory',
        select: 'name gstRate fieldVisibility'
      })
      .populate('tags');
    
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching item' });
  }
};

module.exports = {
  getAllItems,
  getItemById
};