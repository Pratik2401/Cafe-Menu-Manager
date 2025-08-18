const Size = require('../models/SizeModel.js');
const Item = require('../models/ItemModel.js');
const mongoose = require('mongoose');
const { adminAuth } = require('../middlewares/adminAuth.js');
const { deleteImage } = require('../utils/imageUploads.js');

/**
 * Create a new size
 */
const createSize = async (req, res) => {
  try {
    const { name, isDefault, group } = req.body;

    // Validate required fields
    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Size name is required'
      });
      return;
    }
    
    // Check if size already exists in the same group
    const existingSize = await Size.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      group: group || 'Default'
    });
    if (existingSize) {
      res.status(400).json({
        success: false,
        message: 'Size with this name already exists in this group'
      });
      return;
    }


    // Create a new size
    const newSize = new Size({
      name,
      isDefault: isDefault || false,
      group: group || 'Default'
    });

    await newSize.save();

    res.status(201).json({
      success: true,
      message: 'Size created successfully',
      data: newSize
    });
  } catch (error) {
    console.error('Error creating size:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create size',
      error: error.message
    });
  }
};

/**
 * Get all sizes
 */
const getAllSizes = async (req, res) => {
  try {
    const sizes = await Size.find().sort({ createdAt: 1 });
    
    res.status(200).json({
      success: true,
      data: sizes
    });
  } catch (error) {
    console.error('Error fetching sizes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sizes',
      error: error.message
    });
  }
};

/**
 * Get size by ID
 */
const getSizeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid size ID'
      });
      return;
    }
    
    const size = await Size.findById(id);
    
    if (!size) {
      res.status(404).json({
        success: false,
        message: 'Size not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: size
    });
  } catch (error) {
    console.error('Error fetching size:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch size',
      error: error.message
    });
  }
};

/**
 * Update size
 */
const updateSize = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isDefault, group } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid size ID'
      });
      return;
    }
    
    // Check if size exists
    const size = await Size.findById(id);
    if (!size) {
      res.status(404).json({
        success: false,
        message: 'Size not found'
      });
      return;
    }
    
    // If name is being changed, check if the new name already exists in the same group
    if (name && name !== size.name) {
      const groupToCheck = group !== undefined ? group : size.group;
      const existingSize = await Size.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        group: groupToCheck
      });
      if (existingSize && existingSize._id && existingSize._id.toString() !== id) {
        res.status(400).json({
          success: false,
          message: 'Size with this name already exists in this group'
        });
        return;
      }
    }
    
    // Prepare update object
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (isDefault !== undefined) updateData.isDefault = isDefault;
    if (group !== undefined) updateData.group = group;
    
    // Update the size
    const updatedSize = await Size.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Size updated successfully',
      data: updatedSize
    });
  } catch (error) {
    console.error('Error updating size:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update size',
      error: error.message
    });
  }
};

/**
 * Delete size
 */
const deleteSize = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid size ID'
      });
      return;
    }
    
    const size = await Size.findById(id);
    
    if (!size) {
      res.status(404).json({
        success: false,
        message: 'Size not found'
      });
      return;
    }
    
    await Size.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Size deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting size:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete size',
      error: error.message
    });
  }
};

/**
 * Add size to item
 */
const addSizeToItem = async (req, res) => {
  try {
    const { itemId, sizeId } = req.params;
    const { price } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(itemId) || !mongoose.Types.ObjectId.isValid(sizeId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid item ID or size ID'
      });
      return;
    }
    
    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Item not found'
      });
      return;
    }
    
    // Check if size exists
    const size = await Size.findById(sizeId);
    if (!size) {
      res.status(404).json({
        success: false,
        message: 'Size not found'
      });
      return;
    }
    
    // Check if size is already added to item's sizePrices
    if (item.sizePrices && item.sizePrices.some(sp => sp.sizeId.toString() === sizeId)) {
      res.status(400).json({
        success: false,
        message: 'Size already added to this item'
      });
      return;
    }
    
    // Add size to item's sizePrices
    if (!item.sizePrices) {
      item.sizePrices = [];
    }
    
    // Add the size ID to the sizePrices array with the provided price or default to item's price
    item.sizePrices.push({
      sizeId: new mongoose.Types.ObjectId(sizeId),
      price: price || item.price
    });
    
    await item.save();
    
    res.status(200).json({
      success: true,
      message: 'Size added to item successfully',
      data: item
    });
  } catch (error) {
    console.error('Error adding size to item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add size to item',
      error: error.message
    });
  }
};

/**
 * Remove size from item
 */
const removeSizeFromItem = async (req, res) => {
  try {
    const { itemId, sizeId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(itemId) || !mongoose.Types.ObjectId.isValid(sizeId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid item ID or size ID'
      });
      return;
    }
    
    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Item not found'
      });
      return;
    }
    
    // Check if size is added to item's sizePrices
    if (!item.sizePrices || !item.sizePrices.some(sp => sp.sizeId.toString() === sizeId)) {
      res.status(404).json({
        success: false,
        message: 'Size not found in this item'
      });
      return;
    }
    
    // Remove size from item's sizePrices
    item.sizePrices = item.sizePrices.filter(sp => sp.sizeId.toString() !== sizeId);
    
    await item.save();
    
    res.status(200).json({
      success: true,
      message: 'Size removed from item successfully',
      data: item
    });
  } catch (error) {
    console.error('Error removing size from item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove size from item',
      error: error.message
    });
  }
};

/**
 * Delete all sizes in a group
 */
const deleteSizeGroup = async (req, res) => {
  try {
    const { group } = req.params;
    
    if (!group) {
      res.status(400).json({
        success: false,
        message: 'Group name is required'
      });
      return;
    }
    
    // Find all sizes in the group
    const sizesToDelete = await Size.find({ group: group });
    
    if (sizesToDelete.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No sizes found in this group'
      });
      return;
    }
    
    // Delete all sizes in the group
    await Size.deleteMany({ group: group });
    
    res.status(200).json({
      success: true,
      message: `Successfully deleted ${sizesToDelete.length} sizes from group "${group}"`,
      deletedCount: sizesToDelete.length
    });
  } catch (error) {
    console.error('Error deleting size group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete size group',
      error: error.message
    });
  }
};

/**
 * Export sizes to CSV
 */
const exportSizesToCSV = async (req, res) => {
  try {
    const sizes = await Size.find().sort({ group: 1, name: 1 });
    
    // Create CSV header
    let csv = 'Group,Name,Enabled,Is Default\n';
    
    // Add data rows
    sizes.forEach(size => {
      csv += `${size.group},${size.name},${size.enabled},${size.isDefault}\n`;
    });
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sizes.csv');
    
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting sizes to CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export sizes to CSV',
      error: error.message
    });
  }
};

/**
 * Toggle size enabled status
 */
const toggleSizeEnabled = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid size ID'
      });
      return;
    }
    
    const size = await Size.findById(id);
    if (!size) {
      res.status(404).json({
        success: false,
        message: 'Size not found'
      });
      return;
    }
    
    // Toggle the enabled status
    size.enabled = !size.enabled;
    await size.save();
    
    res.status(200).json({
      success: true,
      message: `Size ${size.enabled ? 'enabled' : 'disabled'} successfully`,
      data: size
    });
  } catch (error) {
    console.error('Error toggling size enabled status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle size status',
      error: error.message
    });
  }
};

module.exports = {
  createSize: createSize,
  getAllSizes: getAllSizes,
  getSizeById: getSizeById,
  updateSize: updateSize,
  deleteSize: deleteSize,
  addSizeToItem: addSizeToItem,
  removeSizeFromItem: removeSizeFromItem,
  deleteSizeGroup: deleteSizeGroup,
  exportSizesToCSV: exportSizesToCSV,
  toggleSizeEnabled: toggleSizeEnabled
};