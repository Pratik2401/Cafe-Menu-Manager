const EventItem = require('../models/EventItemModel.js');
const mongoose = require('mongoose');
const { adminAuth } = require('../middlewares/adminAuth.js');
const { deleteImage } = require('../utils/imageUploads.js');

/**
 * Create a new event item
 */
const createEventItem = async (req, res) => {
  try {
    const { itemName, itemDescription, itemPrice, itemCategory, eventId } = req.body;

    // Validate required fields
    if (!itemName || !itemDescription || !itemPrice || !itemCategory || !eventId) {
      res.status(400).json({
        success: false,
        message: 'Item name, description, price, category, and event ID are required'
      });
      return;
    }

    // Validate category - check if it's a valid FoodCategory ID
    const FoodCategory = require('../models/FoodCategoryModel.js').default;
    const categoryExists = await FoodCategory.findById(itemCategory);
    if (!categoryExists) {
      res.status(400).json({
        success: false,
        message: 'Invalid item category'
      });
      return;
    }

    // Create a new event item
    const newEventItem = new EventItem({
      itemName,
      itemDescription,
      itemPrice: Number(itemPrice),
      itemCategory,
      eventId,
      isActive: true
    });

    await newEventItem.save();

    res.status(201).json({
      success: true,
      message: 'Event item created successfully',
      data: newEventItem
    });
  } catch (error) {
    console.error('Error creating event item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event item',
      error: error.message
    });
  }
};

/**
 * Get all event items
 */
const getAllEventItems = async (req, res) => {
  try {
    const { active, eventId } = req.query;
    
    let query = {};
    if (active === 'true') {
      query.isActive = true;
    } else if (active === 'false') {
      query.isActive = false;
    }
    
    if (eventId) {
      query.eventId = eventId;
    }
    
    const eventItems = await EventItem.find(query).sort({ itemName: 1 });
    
    res.status(200).json({
      success: true,
      data: eventItems
    });
  } catch (error) {
    console.error('Error fetching event items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event items',
      error: error.message
    });
  }
};

/**
 * Get event item by ID
 */
const getEventItemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const eventItem = await EventItem.findById(id);
    
    if (!eventItem) {
      res.status(404).json({
        success: false,
        message: 'Event item not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: eventItem
    });
  } catch (error) {
    console.error('Error fetching event item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event item',
      error: error.message
    });
  }
};

/**
 * Update event item
 */
const updateEventItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate category if provided - check if it's a valid FoodCategory ID
    if (updateData.itemCategory) {
      const FoodCategory = require('../models/FoodCategoryModel.js').default;
      const categoryExists = await FoodCategory.findById(updateData.itemCategory);
      if (!categoryExists) {
        res.status(400).json({
          success: false,
          message: 'Invalid item category'
        });
        return;
      }
    }
    
    // Update the event item
    const updatedEventItem = await EventItem.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedEventItem) {
      res.status(404).json({
        success: false,
        message: 'Event item not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Event item updated successfully',
      data: updatedEventItem
    });
  } catch (error) {
    console.error('Error updating event item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event item',
      error: error.message
    });
  }
};

/**
 * Delete event item
 */
const deleteEventItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const eventItem = await EventItem.findByIdAndDelete(id);
    
    if (!eventItem) {
      res.status(404).json({
        success: false,
        message: 'Event item not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Event item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event item',
      error: error.message
    });
  }
};

/**
 * Toggle event item active status
 */
const toggleEventItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
      return;
    }
    
    const updatedEventItem = await EventItem.findByIdAndUpdate(
      id,
      { $set: { isActive } },
      { new: true }
    );
    
    if (!updatedEventItem) {
      res.status(404).json({
        success: false,
        message: 'Event item not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: `Event item ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedEventItem
    });
  } catch (error) {
    console.error('Error toggling event item status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle event item status',
      error: error.message
    });
  }
};

module.exports = {
  createEventItem: createEventItem,
  getAllEventItems: getAllEventItems,
  getEventItemById: getEventItemById,
  updateEventItem: updateEventItem,
  deleteEventItem: deleteEventItem,
  toggleEventItemStatus: toggleEventItemStatus
};