const DailyOffer = require('../models/DailyOfferModel.js');
const Item = require('../models/ItemModel.js');
const mongoose = require('mongoose');
const { uploadImage, deleteImage } = require('../utils/imageUploads.js');
const { adminAuth } = require('../middlewares/adminAuth.js');

/**
 * Create a new daily offer
 */
const createDailyOffer = async (req, res) => {
  try {
    const { name, description, startDate, endDate, startTime, endTime, offers, isRecurring, recurringPattern } = req.body;

    // Validate required fields
    if (!name || !startDate || !endDate || !startTime || !endTime) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
      return;
    }

    if (start > end) {
      res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
      return;
    }

    // Process background image
    let backgroundImageUrl = '';
    const backgroundImageFile = req.files?.find((file) => file.fieldname === 'backgroundImage');
    if (backgroundImageFile) {
      backgroundImageUrl = await uploadImage(
        backgroundImageFile.buffer,
        `daily-offer-${Date.now()}.${backgroundImageFile.originalname.split('.').pop()}`,
        'daily-offers'
      );
    } else if (req.body.backgroundImage) {
      // Handle base64 image if provided in request body
      if (req.body.backgroundImage.startsWith('data:image/')) {
        const base64Data = req.body.backgroundImage.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        backgroundImageUrl = await uploadImage(
          buffer,
          `daily-offer-${Date.now()}.jpg`,
          'daily-offers'
        );
      } else {
        backgroundImageUrl = req.body.backgroundImage;
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Background image is required'
      });
      return;
    }

    // Process promotional image
    let promotionalImageUrl = '';
    const promotionalImageFile = req.files?.find((file) => file.fieldname === 'promotionalImage');
    if (promotionalImageFile) {
      promotionalImageUrl = await uploadImage(
        promotionalImageFile.buffer,
        `daily-offer-promo-${Date.now()}.${promotionalImageFile.originalname.split('.').pop()}`,
        'daily-offers'
      );
    } else if (req.body.promotionalImage) {
      // Handle base64 image if provided in request body
      if (req.body.promotionalImage.startsWith('data:image/')) {
        const base64Data = req.body.promotionalImage.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        promotionalImageUrl = await uploadImage(
          buffer,
          `daily-offer-promo-${Date.now()}.jpg`,
          'daily-offers'
        );
      } else {
        promotionalImageUrl = req.body.promotionalImage;
      }
    }

    // Process offers
    let processedOffers = [];
    if (offers) {
      let parsedOffers;
      try {
        parsedOffers = typeof offers === 'string' ? JSON.parse(offers) : offers;
      } catch (error) {
        console.error('Error parsing offers:', error);
        parsedOffers = [];
      }

      if (Array.isArray(parsedOffers)) {
        processedOffers = await Promise.all(parsedOffers.map(async (offer, index) => {
          // Process offer image from file upload or base64
          let offerImageUrl = offer.imageUrl || '';
          
          // Check for uploaded file first
          const offerImageFile = req.files?.find((file) => file.fieldname === `offerImage_${index}`);
          if (offerImageFile) {
            offerImageUrl = await uploadImage(
              offerImageFile.buffer,
              `offer-${Date.now()}-${index}.${offerImageFile.originalname.split('.').pop()}`,
              'daily-offers/nested'
            );
          } else if (offerImageUrl && offerImageUrl.startsWith('data:image/')) {
            const base64Data = offerImageUrl.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            offerImageUrl = await uploadImage(
              buffer,
              `offer-${Date.now()}-${index}.jpg`,
              'daily-offers/nested'
            );
          }

          // Process items
          const processedItems = await Promise.all((offer.items || []).map(async (item) => {
            // Handle new items (without ObjectId)
            if (item.isNew) {
              return {
                quantity: item.quantity || 1,
                name: item.name,
                description: item.description,
                price: item.price,
                category: item.category
              };
            } else {
              const itemId = typeof item === 'string' ? item : item.item;
              const quantity = typeof item === 'string' ? 1 : (item.quantity || 1);

              // Get item name and price if not provided
              let itemName = typeof item === 'object' ? item.name : undefined;
              let itemPrice = typeof item === 'object' ? item.price : undefined;

              if ((!itemName || !itemPrice) && mongoose.Types.ObjectId.isValid(itemId)) {
                const itemDoc = await Item.findById(itemId);
                if (itemDoc) {
                  itemName = itemName || itemDoc.name;
                  itemPrice = itemPrice || itemDoc.price;
                }
              }

              return {
                item: itemId,
                quantity,
                name: itemName,
                description: item.description,
                price: itemPrice,
                category: item.category
              };
            }
          }));

          return {
            name: offer.name,
            description: offer.description,
            actualPrice: offer.actualPrice || 0,
            offerPrice: offer.offerPrice || 0,
            imageUrl: offerImageUrl,
            items: processedItems
          };
        }));
      }
    }

    // Create the daily offer
    const dailyOffer = new DailyOffer({
      name,
      description,
      backgroundImage: backgroundImageUrl,
      promotionalImage: promotionalImageUrl,
      startDate,
      endDate,
      startTime,
      endTime,
      isRecurring: isRecurring || false,
      recurringPattern: isRecurring ? {
        frequency: recurringPattern?.frequency || 'weekly',
        dayOfWeek: recurringPattern?.dayOfWeek || 0,
        dayOfMonth: recurringPattern?.dayOfMonth || 1,
        endRecurrence: recurringPattern?.endRecurrence ? new Date(recurringPattern.endRecurrence) : undefined
      } : undefined,
      offers: processedOffers
    });

    await dailyOffer.save();

    res.status(201).json({
      success: true,
      message: 'Daily offer created successfully',
      data: dailyOffer
    });
  } catch (error) {
    console.error('Error creating daily offer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create daily offer',
      error: error.message
    });
  }
};

/**
 * Get all daily offers
 */
const getAllDailyOffers = async (req, res) => {
  try {
    const { active } = req.query;
    
    let query = {};
    if (active === 'true') {
      const now = new Date();
      query = { 
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      };
    } else if (active === 'false') {
      query = { isActive: false };
    }
    
    const dailyOffers = await DailyOffer.find(query).sort({ startDate: -1 });
    
    res.status(200).json({
      success: true,
      data: dailyOffers
    });
  } catch (error) {
    console.error('Error fetching daily offers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily offers',
      error: error.message
    });
  }
};

/**
 * Get daily offer by ID
 */
const getDailyOfferById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid daily offer ID'
      });
      return;
    }
    
    const dailyOffer = await DailyOffer.findById(id).populate({
      path: 'offers.items.item',
      select: 'name price image'
    });
    
    if (!dailyOffer) {
      res.status(404).json({
        success: false,
        message: 'Daily offer not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: dailyOffer
    });
  } catch (error) {
    console.error('Error fetching daily offer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily offer',
      error: error.message
    });
  }
};

/**
 * Update daily offer
 */
const updateDailyOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, startTime, endTime, offers, isActive, isRecurring, recurringPattern } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid daily offer ID'
      });
      return;
    }
    
    // Check if daily offer exists
    const dailyOffer = await DailyOffer.findById(id);
    if (!dailyOffer) {
      res.status(404).json({
        success: false,
        message: 'Daily offer not found'
      });
      return;
    }
    
    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format'
        });
        return;
      }

      if (start > end) {
        res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
        return;
      }
    }

    // Process background image if provided
    let backgroundImageUrl = dailyOffer.backgroundImage;
    const backgroundImageFile = req.files?.find((file) => file.fieldname === 'backgroundImage');
    if (backgroundImageFile) {
      // Delete old background image
      if (dailyOffer.backgroundImage) {
        deleteImage(dailyOffer.backgroundImage);
      }
      backgroundImageUrl = await uploadImage(
        backgroundImageFile.buffer,
        `daily-offer-${Date.now()}.${backgroundImageFile.originalname.split('.').pop()}`,
        'daily-offers'
      );
    } else if (req.body.backgroundImage && req.body.backgroundImage !== dailyOffer.backgroundImage) {
      // Handle base64 image if provided in request body
      if (req.body.backgroundImage.startsWith('data:image/')) {
        // Delete old background image
        if (dailyOffer.backgroundImage) {
          deleteImage(dailyOffer.backgroundImage);
        }
        const base64Data = req.body.backgroundImage.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        backgroundImageUrl = await uploadImage(
          buffer,
          `daily-offer-${Date.now()}.jpg`,
          'daily-offers'
        );
      } else {
        backgroundImageUrl = req.body.backgroundImage;
      }
    }

    // Process promotional image if provided
    let promotionalImageUrl = dailyOffer.promotionalImage;
    const promotionalImageFile = req.files?.find((file) => file.fieldname === 'promotionalImage');
    if (promotionalImageFile) {
      // Delete old promotional image
      if (dailyOffer.promotionalImage) {
        deleteImage(dailyOffer.promotionalImage);
      }
      promotionalImageUrl = await uploadImage(
        promotionalImageFile.buffer,
        `daily-offer-promo-${Date.now()}.${promotionalImageFile.originalname.split('.').pop()}`,
        'daily-offers'
      );
    } else if (req.body.promotionalImage && req.body.promotionalImage !== dailyOffer.promotionalImage) {
      // Handle base64 image if provided in request body
      if (req.body.promotionalImage.startsWith('data:image/')) {
        // Delete old promotional image
        if (dailyOffer.promotionalImage) {
          deleteImage(dailyOffer.promotionalImage);
        }
        const base64Data = req.body.promotionalImage.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        promotionalImageUrl = await uploadImage(
          buffer,
          `daily-offer-promo-${Date.now()}.jpg`,
          'daily-offers'
        );
      } else {
        promotionalImageUrl = req.body.promotionalImage;
      }
    }

    // Process offers if provided
    let processedOffers = dailyOffer.offers;
    if (offers) {
      let parsedOffers;
      try {
        parsedOffers = typeof offers === 'string' ? JSON.parse(offers) : offers;
      } catch (error) {
        console.error('Error parsing offers:', error);
        parsedOffers = [];
      }
      
      if (Array.isArray(parsedOffers)) {
        processedOffers = await Promise.all(parsedOffers.map(async (offer, index) => {
          // Process offer image from file upload or base64
          let offerImageUrl = offer.imageUrl || '';
          
          // Check for uploaded file first
          const offerImageFile = req.files?.find((file) => file.fieldname === `offerImage_${index}`);
          if (offerImageFile) {
            offerImageUrl = await uploadImage(
              offerImageFile.buffer,
              `offer-${Date.now()}-${index}.${offerImageFile.originalname.split('.').pop()}`,
              'daily-offers/nested'
            );
          } else if (offerImageUrl && offerImageUrl.startsWith('data:image/')) {
            const base64Data = offerImageUrl.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            offerImageUrl = await uploadImage(
              buffer,
              `offer-${Date.now()}-${index}.jpg`,
              'daily-offers/nested'
            );
          }

          // Process items
          const processedItems = await Promise.all((offer.items || []).map(async (item) => {
            // Handle new items (without ObjectId)
            if (item.isNew) {
              return {
                quantity: item.quantity || 1,
                name: item.name,
                description: item.description,
                price: item.price,
                category: item.category
              };
            } else {
              const itemId = typeof item === 'string' ? item : item.item;
              const quantity = typeof item === 'string' ? 1 : (item.quantity || 1);
              
              // Get item name and price if not provided
              let itemName = typeof item === 'object' ? item.name : undefined;
              let itemPrice = typeof item === 'object' ? item.price : undefined;
              
              if ((!itemName || !itemPrice) && mongoose.Types.ObjectId.isValid(itemId)) {
                const itemDoc = await Item.findById(itemId);
                if (itemDoc) {
                  itemName = itemName || itemDoc.name;
                  itemPrice = itemPrice || itemDoc.price;
                }
              }

              return {
                item: itemId,
                quantity,
                name: itemName,
                description: item.description,
                price: itemPrice,
                category: item.category
              };
            }
          }));

          return {
            _id: offer._id, // Preserve existing ID if it exists
            name: offer.name,
            description: offer.description,
            actualPrice: offer.actualPrice || 0,
            offerPrice: offer.offerPrice || 0,
            imageUrl: offerImageUrl,
            items: processedItems
          };
        }));
      }
    }

    // Update the daily offer
    const updatedDailyOffer = await DailyOffer.findByIdAndUpdate(
      id,
      {
        name: name || dailyOffer.name,
        description: description !== undefined ? description : dailyOffer.description,
        backgroundImage: backgroundImageUrl,
        promotionalImage: promotionalImageUrl,
        startDate: startDate || dailyOffer.startDate,
        endDate: endDate || dailyOffer.endDate,
        startTime: startTime || dailyOffer.startTime,
        endTime: endTime || dailyOffer.endTime,
        isActive: isActive !== undefined ? isActive : dailyOffer.isActive,
        isRecurring: isRecurring !== undefined ? isRecurring : dailyOffer.isRecurring,
        recurringPattern: isRecurring ? {
          frequency: recurringPattern?.frequency || dailyOffer.recurringPattern?.frequency || 'weekly',
          dayOfWeek: recurringPattern?.dayOfWeek !== undefined ? recurringPattern.dayOfWeek : dailyOffer.recurringPattern?.dayOfWeek || 0,
          dayOfMonth: recurringPattern?.dayOfMonth !== undefined ? recurringPattern.dayOfMonth : dailyOffer.recurringPattern?.dayOfMonth || 1,
          endRecurrence: recurringPattern?.endRecurrence ? new Date(recurringPattern.endRecurrence) : dailyOffer.recurringPattern?.endRecurrence
        } : undefined,
        offers: processedOffers
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Daily offer updated successfully',
      data: updatedDailyOffer
    });
  } catch (error) {
    console.error('Error updating daily offer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update daily offer',
      error: error.message
    });
  }
};

/**
 * Delete daily offer
 */
const deleteDailyOffer = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid daily offer ID'
      });
      return;
    }
    
    const dailyOffer = await DailyOffer.findById(id);
    
    if (!dailyOffer) {
      res.status(404).json({
        success: false,
        message: 'Daily offer not found'
      });
      return;
    }
    
    // Delete background image
    if (dailyOffer.backgroundImage) {
      deleteImage(dailyOffer.backgroundImage);
    }
    
    // Delete promotional image
    if (dailyOffer.promotionalImage) {
      deleteImage(dailyOffer.promotionalImage);
    }
    
    // Delete offer images
    if (dailyOffer.offers && dailyOffer.offers.length > 0) {
      dailyOffer.offers.forEach(offer => {
        if (offer.imageUrl) {
          deleteImage(offer.imageUrl);
        }
      });
    }
    
    await DailyOffer.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Daily offer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting daily offer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete daily offer',
      error: error.message
    });
  }
};

/**
 * Toggle daily offer active status
 */
const toggleDailyOfferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid daily offer ID'
      });
      return;
    }
    
    if (typeof isActive !== 'boolean') {
      res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
      return;
    }
    
    const dailyOffer = await DailyOffer.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
    
    if (!dailyOffer) {
      res.status(404).json({
        success: false,
        message: 'Daily offer not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: `Daily offer ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: dailyOffer
    });
  } catch (error) {
    console.error('Error toggling daily offer status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle daily offer status',
      error: error.message
    });
  }
};

/**
 * Upload offer image
 */
const uploadOfferImage = async (req, res) => {
  try {
    const { id, offerId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(offerId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid ID'
      });
      return;
    }
    
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
      return;
    }
    
    // Upload the image
    const imageUrl = await uploadImage(
      req.file.buffer,
      `offer-${id}-${offerId}-${Date.now()}.${req.file.originalname.split('.').pop()}`,
      'daily-offers/nested'
    );
    
    // Update the offer with the new image URL
    const dailyOffer = await DailyOffer.findOneAndUpdate(
      { _id: id, 'offers._id': offerId },
      { $set: { 'offers.$.imageUrl': imageUrl } },
      { new: true }
    );
    
    if (!dailyOffer) {
      res.status(404).json({
        success: false,
        message: 'Daily offer or nested offer not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Offer image uploaded successfully',
      data: {
        imageUrl,
        dailyOffer
      }
    });
  } catch (error) {
    console.error('Error uploading offer image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload offer image',
      error: error.message
    });
  }
};

module.exports = {
  createDailyOffer: createDailyOffer,
  getAllDailyOffers: getAllDailyOffers,
  getDailyOfferById: getDailyOfferById,
  updateDailyOffer: updateDailyOffer,
  deleteDailyOffer: deleteDailyOffer,
  toggleDailyOfferStatus: toggleDailyOfferStatus,
  uploadOfferImage: uploadOfferImage
};