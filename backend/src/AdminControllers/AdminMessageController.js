const Cafe = require('../models/CafeModel.js');
const { adminAuth } = require('../middlewares/adminAuth.js');
const { deleteImage } = require('../utils/imageUploads.js');

/**
 * Get all custom messages
 */
const getMessages = async (req, res) => {
  try {
    let cafe = await Cafe.findOne();
    
    if (!cafe) {
      cafe = await Cafe.create({
        name: 'Default Cafe',
        location: 'Default Location',
        gstIncluded: false,
        cgst: 0,
        sgst: 0,
        allowOrdering: true,
        radius: 0,
        customMessages: {
          noItemsText: 'No items available',
          noCategoryText: 'No categories available',
          loadingText: 'Loading...'
        }
      });
    }
    
    // Ensure customMessages exists with defaults
    if (!cafe.customMessages) {
      cafe.customMessages = {
        noItemsText: 'No items available',
        noCategoryText: 'No categories available', 
        loadingText: 'Loading...'
      };
      await cafe.save();
    }
    
    res.status(200).json({
      success: true,
      data: cafe.customMessages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

/**
 * Update custom messages
 */
const updateMessages = async (req, res) => {
  try {
    const { noItemsText, noCategoryText, loadingText } = req.body;
    
    let cafe = await Cafe.findOne();
    
    if (!cafe) {
      cafe = await Cafe.create({
        name: 'Default Cafe',
        location: 'Default Location',
        gstIncluded: false,
        cgst: 0,
        sgst: 0,
        allowOrdering: true,
        radius: 0,
        customMessages: {
          noItemsText: noItemsText || 'No items available',
          noCategoryText: noCategoryText || 'No categories available',
          loadingText: loadingText || 'Loading...'
        }
      });
      
      res.status(201).json({
        success: true,
        message: 'Messages created successfully',
        data: cafe.customMessages
      });
      return;
    }
    
    // Update the messages
    const updateData = {};
    if (noItemsText !== undefined) updateData['customMessages.noItemsText'] = noItemsText;
    if (noCategoryText !== undefined) updateData['customMessages.noCategoryText'] = noCategoryText;
    if (loadingText !== undefined) updateData['customMessages.loadingText'] = loadingText;
    
    const updatedCafe = await Cafe.findByIdAndUpdate(
      cafe._id,
      { $set: updateData },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Messages updated successfully',
      data: updatedCafe.customMessages
    });
  } catch (error) {
    console.error('Error updating messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update messages',
      error: error.message
    });
  }
};

module.exports = {
  getMessages,
  updateMessages
};