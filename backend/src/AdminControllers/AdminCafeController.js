const Cafe = require('../models/CafeModel.js');
const mongoose = require('mongoose');
const { uploadImage, deleteImage } = require('../utils/imageUploads.js');
const { adminAuth } = require('../middlewares/adminAuth.js');

/**
 * Get cafe details
 */
const getCafe = async (req, res) => {
  try {
    // Since Cafe is a singleton, we'll get the first document or create one if it doesn't exist
    let cafe = await Cafe.findOne();
    
    if (!cafe) {
      cafe = await Cafe.create({
        name: 'Default Cafe',
        location: 'Default Location',
        gstIncluded: false,
        cgst: 0,
        sgst: 0,
        allowOrdering: true,
        radius: 0
      });
    }
    
    res.status(200).json({
      success: true,
      data: cafe
    });
  } catch (error) {
    console.error('Error fetching cafe details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cafe details',
      error: error.message
    });
  }
};

/**
 * Update cafe details
 */
const updateCafe = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Name is required'
      });
      return;
    }
    
    // Find the cafe document or create one if it doesn't exist
    let cafe = await Cafe.findOne();
    
    if (!cafe) {
      cafe = await Cafe.create({
        name,
        location: 'Default Location',
        gstIncluded: false,
        cgst: 0,
        sgst: 0,
        allowOrdering: true,
        radius: 0
      });
      
      res.status(201).json({
        success: true,
        message: 'Cafe name created successfully',
        data: cafe
      });
      return;
    }
    
    // Update the cafe details
    const updatedCafe = await Cafe.findByIdAndUpdate(
      cafe._id,
      { $set: { name } },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Cafe name updated successfully',
      data: updatedCafe
    });
  } catch (error) {
    console.error('Error updating cafe details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cafe details',
      error: error.message
    });
  }
};

/**
 * Upload cafe image
 */
const uploadCafeImage = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
      return;
    }
    
    // Find the cafe document
    let cafe = await Cafe.findOne();
    
    if (!cafe) {
      res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
      return;
    }
    
    // Delete old image if it exists
    if (cafe.imageUrl) {
      deleteImage(cafe.imageUrl);
    }
    
    // Upload the image
    const imageUrl = await uploadImage(
      req.file.buffer,
      `cafe-${Date.now()}.${req.file.originalname.split('.').pop()}`,
      'cafe'
    );
    
    // Update the cafe with the new image URL
    const updatedCafe = await Cafe.findByIdAndUpdate(
      cafe._id,
      { $set: { imageUrl } },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Cafe image uploaded successfully',
      data: {
        imageUrl,
        cafe: updatedCafe
      }
    });
  } catch (error) {
    console.error('Error uploading cafe image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload cafe image',
      error: error.message
    });
  }
};

/**
 * Upload cafe background image for landing and menu pages
 */
const uploadBackgroundImage = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
      return;
    }
    
    // Find the cafe document
    let cafe = await Cafe.findOne();
    
    if (!cafe) {
      res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
      return;
    }
    
    // Delete old background image if it exists
    if (cafe.backgroundImageUrl) {
      deleteImage(cafe.backgroundImageUrl);
    }
    
    // Upload the background image
    const backgroundImageUrl = await uploadImage(
      req.file.buffer,
      `background-${Date.now()}.${req.file.originalname.split('.').pop()}`,
      'backgrounds'
    );
    
    // Update the cafe with the new background image URL
    const updatedCafe = await Cafe.findByIdAndUpdate(
      cafe._id,
      { $set: { backgroundImageUrl } },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Background image uploaded successfully',
      data: {
        backgroundImageUrl,
        cafe: updatedCafe
      }
    });
  } catch (error) {
    console.error('Error uploading background image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload background image',
      error: error.message
    });
  }
};

/**
 * Update tax settings
 */
const updateTaxSettings = async (req, res) => {
  try {
    const { gstIncluded, cgst, sgst } = req.body;
    
    if (gstIncluded === undefined || cgst === undefined || sgst === undefined) {
      res.status(400).json({
        success: false,
        message: 'gstIncluded, cgst, and sgst are required'
      });
      return;
    }
    
    // Find the cafe document or create one if it doesn't exist
    let cafe = await Cafe.findOne();
    
    if (!cafe) {
      cafe = await Cafe.create({
        name: 'Default Cafe',
        location: 'Default Location',
        gstIncluded,
        cgst,
        sgst,
        allowOrdering: true,
        radius: 0
      });
      
      res.status(201).json({
        success: true,
        message: 'Tax settings created successfully',
        data: cafe
      });
      return;
    }
    
    // Update the tax settings
    const updatedCafe = await Cafe.findByIdAndUpdate(
      cafe._id,
      { $set: { gstIncluded, cgst, sgst } },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Tax settings updated successfully',
      data: updatedCafe
    });
  } catch (error) {
    console.error('Error updating tax settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tax settings',
      error: error.message
    });
  }
};

/**
 * Update location settings
 */
const updateLocationSettings = async (req, res) => {
  try {
    const { radius } = req.body;
    
    if (radius === undefined) {
      res.status(400).json({
        success: false,
        message: 'Radius is required'
      });
      return;
    }
    
    // Find the cafe document or create one if it doesn't exist
    let cafe = await Cafe.findOne();
    
    if (!cafe) {
      cafe = await Cafe.create({
        name: 'Default Cafe',
        location: 'Default Location',
        gstIncluded: false,
        cgst: 0,
        sgst: 0,
        allowOrdering: true,
        radius
      });
      
      res.status(201).json({
        success: true,
        message: 'Location settings created successfully',
        data: cafe
      });
      return;
    }
    
    // Update the location settings
    const updatedCafe = await Cafe.findByIdAndUpdate(
      cafe._id,
      { $set: { radius } },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Location settings updated successfully',
      data: updatedCafe
    });
  } catch (error) {
    console.error('Error updating location settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location settings',
      error: error.message
    });
  }
};

/**
 * Toggle ordering status
 */
const toggleOrderingStatus = async (req, res) => {
  try {
    const { allowOrdering } = req.body;
    
    if (allowOrdering === undefined) {
      res.status(400).json({
        success: false,
        message: 'allowOrdering is required'
      });
      return;
    }
    
    // Find the cafe document or create one if it doesn't exist
    let cafe = await Cafe.findOne();
    
    if (!cafe) {
      cafe = await Cafe.create({
        name: 'Default Cafe',
        location: 'Default Location',
        gstIncluded: false,
        cgst: 0,
        sgst: 0,
        allowOrdering,
        radius: 0
      });
      
      res.status(201).json({
        success: true,
        message: 'Ordering status created successfully',
        data: cafe
      });
      return;
    }
    
    // Update the ordering status
    const updatedCafe = await Cafe.findByIdAndUpdate(
      cafe._id,
      { $set: { allowOrdering } },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: `Ordering ${allowOrdering ? 'enabled' : 'disabled'} successfully`,
      data: updatedCafe
    });
  } catch (error) {
    console.error('Error toggling ordering status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle ordering status',
      error: error.message
    });
  }
};

/**
 * Get all tables
 */
const getTables = async (req, res) => {
  try {
    const cafe = await Cafe.findOne();
    
    if (!cafe) {
      res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
      return;
    }
    
    const tables = cafe.tables || {};
    
    res.status(200).json({
      success: true,
      data: Object.entries(tables).map(([tableId, isAvailable]) => ({
        id: tableId,
        isAvailable
      }))
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tables',
      error: error.message
    });
  }
};

/**
 * Create a new table
 */
const createTable = async (req, res) => {
  try {
    const { tableId, isAvailable = true } = req.body;
    
    if (!tableId) {
      res.status(400).json({
        success: false,
        message: 'Table ID is required'
      });
      return;
    }
    
    let cafe = await Cafe.findOne();
    
    if (!cafe) {
      cafe = await Cafe.create({
        name: 'Default Cafe',
        location: 'Default Location',
        tables: { [tableId]: isAvailable },
        gstIncluded: false,
        cgst: 0,
        sgst: 0,
        allowOrdering: true,
        radius: 0
      });
      
      res.status(201).json({
        success: true,
        message: 'Table created successfully',
        data: { id: tableId, isAvailable }
      });
      return;
    }
    
    // Check if table already exists
    if (cafe.tables && cafe.tables.has(tableId)) {
      res.status(400).json({
        success: false,
        message: 'Table already exists'
      });
      return;
    }
    
    // Add the new table
    const updateResult = await Cafe.findByIdAndUpdate(
      cafe._id,
      { $set: { [`tables.${tableId}`]: isAvailable } },
      { new: true }
    );
    
    res.status(201).json({
      success: true,
      message: 'Table created successfully',
      data: { id: tableId, isAvailable }
    });
  } catch (error) {
    console.error('Error creating table:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create table',
      error: error.message
    });
  }
};

/**
 * Update a table
 */
const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { newTableId, isAvailable } = req.body;
    
    if (!newTableId && isAvailable === undefined) {
      res.status(400).json({
        success: false,
        message: 'Either newTableId or isAvailable must be provided'
      });
      return;
    }
    
    const cafe = await Cafe.findOne();
    
    if (!cafe || !cafe.tables || !cafe.tables.has(id)) {
      res.status(404).json({
        success: false,
        message: 'Table not found'
      });
      return;
    }
    
    // If renaming the table
    if (newTableId && newTableId !== id) {
      // Check if new table ID already exists
      if (cafe.tables.has(newTableId)) {
        res.status(400).json({
          success: false,
          message: 'New table ID already exists'
        });
        return;
      }
      
      // Get the current availability
      const currentAvailability = cafe.tables.get(id);
      
      // Create a new table with the new ID
      await Cafe.findByIdAndUpdate(
        cafe._id,
        { 
          $set: { [`tables.${newTableId}`]: isAvailable !== undefined ? isAvailable : currentAvailability },
          $unset: { [`tables.${id}`]: "" }
        }
      );
      
      res.status(200).json({
        success: true,
        message: 'Table updated successfully',
        data: { id: newTableId, isAvailable: isAvailable !== undefined ? isAvailable : currentAvailability }
      });
      return;
    }
    
    // Just updating availability
    if (isAvailable !== undefined) {
      await Cafe.findByIdAndUpdate(
        cafe._id,
        { $set: { [`tables.${id}`]: isAvailable } }
      );
      
      res.status(200).json({
        success: true,
        message: 'Table availability updated successfully',
        data: { id, isAvailable }
      });
      return;
    }
    
    res.status(400).json({
      success: false,
      message: 'No changes to make'
    });
  } catch (error) {
    console.error('Error updating table:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update table',
      error: error.message
    });
  }
};

/**
 * Delete a table
 */
const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cafe = await Cafe.findOne();
    
    if (!cafe || !cafe.tables || !cafe.tables.has(id)) {
      res.status(404).json({
        success: false,
        message: 'Table not found'
      });
      return;
    }
    
    // Remove the table
    await Cafe.findByIdAndUpdate(
      cafe._id,
      { $unset: { [`tables.${id}`]: "" } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Table deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete table',
      error: error.message
    });
  }
};

/**
 * Toggle table availability
 */
const toggleTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cafe = await Cafe.findOne();
    
    if (!cafe || !cafe.tables || !cafe.tables.has(id)) {
      res.status(404).json({
        success: false,
        message: 'Table not found'
      });
      return;
    }
    
    // Toggle the availability
    const currentAvailability = cafe.tables.get(id);
    const newAvailability = !currentAvailability;
    
    await Cafe.findByIdAndUpdate(
      cafe._id,
      { $set: { [`tables.${id}`]: newAvailability } }
    );
    
    res.status(200).json({
      success: true,
      message: `Table ${newAvailability ? 'available' : 'unavailable'} successfully`,
      data: { id, isAvailable: newAvailability }
    });
  } catch (error) {
    console.error('Error toggling table status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle table status',
      error: error.message
    });
  }
};

/**
 * Update menu customization settings
 */
const updateMenuCustomization = async (req, res) => {
  try {
    const { cssVariables, logoUrl, logoBackgroundColor, backgroundImage } = req.body;
    console.log(cssVariables)
    // Find the cafe document or create one if it doesn't exist
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
        menuCustomization: {
          cssVariables: {
            '--bg-primary': '#FEF8F3',
            '--bg-secondary': '#FEAD2E',
            '--bg-tertiary': '#383838',
            '--color-dark': '#383838',
            '--color-accent': '#FEAD2E',
            '--color-secondary': '#666666',
            '--card-bg': '#FFFFFF',
            '--card-text': '#000000'
          },
          logoUrl: logoUrl || '',
          logoBackgroundColor: logoBackgroundColor || '#FFFFFF',
          backgroundImage: backgroundImage || ''
        }
      });
      
      res.status(201).json({
        success: true,
        message: 'Menu customization settings created successfully',
        data: cafe
      });
      return;
    }
    
    // Update the menu customization settings
    const updateData = {};
    
    // Update CSS variables if provided
    if (cssVariables) {
      // Ensure we preserve existing CSS variables and merge with new ones
      const existingCssVariables = cafe.menuCustomization?.cssVariables || {};
      const mergedCssVariables = { ...existingCssVariables, ...cssVariables };
      
      console.log('Existing CSS Variables:', existingCssVariables);
      console.log('Incoming CSS Variables:', cssVariables);
      console.log('Merged CSS Variables:', mergedCssVariables);
      
      Object.entries(mergedCssVariables).forEach(([key, value]) => {
        updateData[`menuCustomization.cssVariables.${key}`] = value;
      });
      
      console.log('Update Data:', updateData);
    }
    
    // Update logo URL if provided
    if (logoUrl !== undefined) {
      updateData['menuCustomization.logoUrl'] = logoUrl;
    }
    
    // Update logo background color if provided
    if (logoBackgroundColor !== undefined) {
      updateData['menuCustomization.logoBackgroundColor'] = logoBackgroundColor;
    }
    
    // Update background image if provided
    if (backgroundImage !== undefined) {
      updateData['menuCustomization.backgroundImage'] = backgroundImage;
    }
    
    const updatedCafe = await Cafe.findByIdAndUpdate(
      cafe._id,
      { $set: updateData },
      { new: true }
    );
    console.log('Updated Cafe CSS Variables:', updatedCafe?.menuCustomization?.cssVariables);
    res.status(200).json({
      success: true,
      message: 'Menu customization settings updated successfully',
      data: updatedCafe
    });
  } catch (error) {
    console.error('Error updating menu customization settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update menu customization settings',
      error: error.message
    });
  }
};

/**
 * Upload menu logo
 */
const uploadMenuLogo = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No logo file provided'
      });
      return;
    }
    
    // Find the cafe document
    let cafe = await Cafe.findOne();
    
    if (!cafe) {
      res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
      return;
    }
    
    // Delete old logo if it exists
    if (cafe.menuCustomization && cafe.menuCustomization.logoUrl) {
      deleteImage(cafe.menuCustomization.logoUrl);
    }
    
    // Upload the logo
    const logoUrl = await uploadImage(
      req.file.buffer,
      `menu-logo-${Date.now()}.${req.file.originalname.split('.').pop()}`,
      'logos'
    );
    
    // Get the logo background color from the request body or use the existing one
    const logoBackgroundColor = req.body.logoBackgroundColor || 
      (cafe.menuCustomization && cafe.menuCustomization.logoBackgroundColor) || 
      '#FFFFFF';
    
    // Update the cafe with the new logo URL and background color
    const updatedCafe = await Cafe.findByIdAndUpdate(
      cafe._id,
      { 
        $set: { 
          'menuCustomization.logoUrl': logoUrl,
          'menuCustomization.logoBackgroundColor': logoBackgroundColor
        } 
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Menu logo uploaded successfully',
      data: {
        logoUrl,
        logoBackgroundColor,
        cafe: updatedCafe
      }
    });
  } catch (error) {
    console.error('Error uploading menu logo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload menu logo',
      error: error.message
    });
  }
};

/**
 * Upload menu background image
 */
const uploadMenuBackgroundImage = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No background image file provided'
      });
      return;
    }
    
    // Find the cafe document
    let cafe = await Cafe.findOne();
    
    if (!cafe) {
      res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
      return;
    }
    
    // Delete old background image if it exists
    if (cafe.menuCustomization && cafe.menuCustomization.backgroundImage) {
      deleteImage(cafe.menuCustomization.backgroundImage);
    }
    
    // Upload the background image
    const backgroundImage = await uploadImage(
      req.file.buffer,
      `menu-bg-${Date.now()}.${req.file.originalname.split('.').pop()}`,
      'backgrounds'
    );
    
    // Update the cafe with the new background image URL
    const updatedCafe = await Cafe.findByIdAndUpdate(
      cafe._id,
      { 
        $set: { 
          'menuCustomization.backgroundImage': backgroundImage
        } 
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Menu background image uploaded successfully',
      data: {
        backgroundImage,
        cafe: updatedCafe
      }
    });
  } catch (error) {
    console.error('Error uploading menu background image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload menu background image',
      error: error.message
    });
  }
};
module.exports = {
  getCafe: getCafe,
  updateCafe: updateCafe,
  uploadCafeImage: uploadCafeImage,
  uploadBackgroundImage: uploadBackgroundImage,
  updateTaxSettings: updateTaxSettings,
  updateLocationSettings: updateLocationSettings,
  toggleOrderingStatus: toggleOrderingStatus,
  getTables: getTables,
  createTable: createTable,
  updateTable: updateTable,
  deleteTable: deleteTable,
  toggleTableStatus: toggleTableStatus,
  updateMenuCustomization: updateMenuCustomization,
  uploadMenuLogo: uploadMenuLogo,
  uploadMenuBackgroundImage: uploadMenuBackgroundImage
};