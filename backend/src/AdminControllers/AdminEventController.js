const Event = require('../models/EventModel.js');
const EventItem = require('../models/EventItemModel.js');
const Item = require('../models/ItemModel.js');
const mongoose = require('mongoose');
const { uploadImage, deleteImage } = require('../utils/imageUploads.js');
const { adminAuth } = require('../middlewares/adminAuth.js');

/**
 * Helper function to process offer items and fetch their details
 */
const processOfferItems = async (offers) => {
  if (!offers || offers.length === 0) return offers;
  
  for (const offer of offers) {
    // Handle base64 image data by uploading to ImageKit
    if (offer.imageUrl && offer.imageUrl.startsWith('data:image/')) {
      try {
        const base64Data = offer.imageUrl.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `offer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const uploadResult = await uploadImage(buffer, fileName, 'offers');
        offer.imageUrl = uploadResult;
      } catch (error) {
        console.error('Error uploading offer image to ImageKit:', error);
        // Keep the base64 as fallback or remove it
        delete offer.imageUrl;
      }
    }
    
    if (offer.items && offer.items.length > 0) {
      // Normalize items to handle both object format and string/ID-only format
      const normalizedItems = offer.items.map((item) => {
        if (typeof item === 'string') {
          // If item is just a string ID
          return { itemId: item, quantity: 1 };
        } else if (typeof item === 'object') {
          // If item is an object with itemId property
          return {
            itemId: item.itemId,
            name: item.name || "Unnamed Item",
            quantity: item.quantity || 1
          };
        }
        return null;
      }).filter(Boolean);
      
      // Fetch item details from both EventItem and Item models
      const itemPromises = normalizedItems.map(async (item) => {
        const itemId = item.itemId;
        // Always preserve the name from the request if it exists
        let itemName = item.name;
        
        // Only look up the name if it's not provided
        if (!itemName) {
          // First check EventItem model
          const eventItem = await EventItem.findById(itemId);
          if (eventItem) {
            itemName = eventItem.itemName;
          } else {
            // Then check regular Item model
            const regularItem = await Item.findById(itemId);
            if (regularItem) {
              itemName = regularItem.name;
            } else {
              // Use a proper name instead of ID-based name
              itemName = "Unnamed Item";
            }
          }
        }
        
        // Return complete item with name
        return {
          itemId,
          name: itemName,
          quantity: item.quantity || 1
        };
      });
      
      // Wait for all item details to be fetched
      offer.items = await Promise.all(itemPromises);
    }
  }
  
  return offers;
};

/**
 * Create a new event
 */
const createEvent = async (req, res) => {
  try {
    console.log('CREATE EVENT - Request body:', JSON.stringify(req.body, null, 2));
    const { title, description, startDate, endDate, location, maxAttendees, tags, eventImageUrl, promotionalImageUrl, isRecurring, recurringPattern } = req.body;

    // Validate required fields
    if (!title || !description || !startDate || !endDate || !location) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
      return;
    }

    // Validate recurring pattern if event is recurring
    if (isRecurring && (!recurringPattern || !recurringPattern.frequency)) {
      res.status(400).json({
        success: false,
        message: 'Recurring pattern is required for recurring events'
      });
      return;
    }

    if (isRecurring && recurringPattern.frequency === 'weekly' && recurringPattern.dayOfWeek === undefined) {
      res.status(400).json({
        success: false,
        message: 'Day of week is required for weekly recurring events'
      });
      return;
    }

    if (isRecurring && recurringPattern.frequency === 'monthly' && !recurringPattern.dayOfMonth) {
      res.status(400).json({
        success: false,
        message: 'Day of month is required for monthly recurring events'
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

    if (start >= end) {
      res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
      return;
    }
    
    // Process offers to ensure item names are included
    const offers = req.body.offers || [];
    console.log('CREATE EVENT - Before processing offers:', JSON.stringify(offers, null, 2));
    const processedOffers = await processOfferItems(offers);
    console.log('CREATE EVENT - After processing offers:', JSON.stringify(processedOffers, null, 2));
    
    // Create a new event
    const eventData = {
      eventId: new mongoose.Types.ObjectId().toString(),
      title,
      description,
      startDate: start,
      endDate: end,
      location,
      currentAttendees: 0,
      isActive: true,
      entryType: req.body.entryType || 'free',
      price: req.body.price || 0,
      isAgeRestricted: req.body.isAgeRestricted || false,
      offers: processedOffers,
      isRecurring: isRecurring || false
    };

    // Add optional fields only if provided
    if (maxAttendees !== undefined) eventData.maxAttendees = maxAttendees;
    if (tags !== undefined) eventData.tags = tags;
    if (eventImageUrl !== undefined) eventData.eventImageUrl = eventImageUrl;
    if (promotionalImageUrl !== undefined) eventData.promotionalImageUrl = promotionalImageUrl;
    if (isRecurring && recurringPattern) eventData.recurringPattern = recurringPattern;

    const newEvent = new Event(eventData);

    await newEvent.save();

    // Fetch the saved event to ensure all fields are properly populated
    const savedEvent = await Event.findOne({ eventId: newEvent.eventId });
    console.log('CREATE EVENT - Saved event:', JSON.stringify(savedEvent, null, 2));

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: savedEvent
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

/**
 * Get all events
 */
const getAllEvents = async (req, res) => {
  try {
    const { active } = req.query;
    
    let query = {};
    if (active === 'true') {
      query = { isActive: true };
    } else if (active === 'false') {
      query = { isActive: false };
    }
    
    const events = await Event.find(query).sort({ startDate: 1 });
    
    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

/**
 * Get event by ID
 */
const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findOne({ eventId });
    
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message
    });
  }
};

/**
 * Update event
 */
const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    console.log('UPDATE EVENT - Event ID:', eventId);
    console.log('UPDATE EVENT - Request body:', JSON.stringify(req.body, null, 2));
    const updateData = req.body;
    
    // Check if event exists
    const event = await Event.findOne({ eventId });
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }
    
    // Validate dates if provided
    if (updateData.startDate && updateData.endDate) {
      const start = new Date(updateData.startDate);
      const end = new Date(updateData.endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format'
        });
        return;
      }

      if (start >= end) {
        res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
        return;
      }
    } else if (updateData.startDate) {
      const start = new Date(updateData.startDate);
      const end = event.endDate;
      
      if (isNaN(start.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid start date format'
        });
        return;
      }

      if (start >= end) {
        res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
        return;
      }
    } else if (updateData.endDate) {
      const start = event.startDate;
      const end = new Date(updateData.endDate);
      
      if (isNaN(end.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid end date format'
        });
        return;
      }

      if (start >= end) {
        res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
        return;
      }
    }
    
    // Process offers to ensure item names are included
    if (updateData.offers && updateData.offers.length > 0) {
      console.log('UPDATE EVENT - Before processing offers:', JSON.stringify(updateData.offers, null, 2));
      updateData.offers = await processOfferItems(updateData.offers);
      console.log('UPDATE EVENT - After processing offers:', JSON.stringify(updateData.offers, null, 2));
    }

    // Explicitly handle isAgeRestricted field to ensure it's always included in the document
    if (updateData.hasOwnProperty('isAgeRestricted')) {
      updateData.isAgeRestricted = Boolean(updateData.isAgeRestricted);
    }

    // Update the event
    const updatedEvent = await Event.findOneAndUpdate(
      { eventId },
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

/**
 * Delete event
 */
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findOne({ eventId });
    
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }
    
    // Delete event images
    if (event.eventImageUrl) {
      deleteImage(event.eventImageUrl);
    }
    if (event.promotionalImageUrl) {
      deleteImage(event.promotionalImageUrl);
    }
    
    // Delete offer images
    if (event.offers && event.offers.length > 0) {
      event.offers.forEach(offer => {
        if (offer.imageUrl) {
          deleteImage(offer.imageUrl);
        }
      });
    }
    
    await Event.deleteOne({ eventId });
    
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

/**
 * Toggle event active status
 */
const toggleEventStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
      return;
    }
    
    const event = await Event.findOne({ eventId });
    
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }
    
    const updatedEvent = await Event.findOneAndUpdate(
      { eventId },
      { $set: { isActive } },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: `Event ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedEvent
    });
  } catch (error) {
    console.error('Error toggling event status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle event status',
      error: error.message
    });
  }
};

/**
 * Get event registrations
 */
const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findOne({ eventId });
    
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }
    
    // Return event details without registrations
    res.status(200).json({
      success: true,
      data: {
        event: event,
        registrations: []
      }
    });
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event registrations',
      error: error.message
    });
  }
};

/**
 * Upload event image
 */
const uploadEventImage = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { imageType } = req.body; // 'event' or 'promotional'
    
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
      return;
    }
    
    if (!imageType || !['event', 'promotional'].includes(imageType)) {
      res.status(400).json({
        success: false,
        message: 'Image type must be either "event" or "promotional"'
      });
      return;
    }
    
    // Check if event exists
    const event = await Event.findOne({ eventId });
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }
    
    // Upload the image using our utility
    const fileName = `${imageType}-${eventId}-${Date.now()}.${req.file.originalname.split('.').pop()}`;
    const imageUrl = await uploadImage(req.file.buffer, fileName, 'events');
    
    // Update the event with the new image URL
    const updateField = imageType === 'event' ? 'eventImageUrl' : 'promotionalImageUrl';
    const updatedEvent = await Event.findOneAndUpdate(
      { eventId },
      { $set: { [updateField]: imageUrl } },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: `${imageType === 'event' ? 'Event' : 'Promotional'} image uploaded successfully`,
      data: {
        imageUrl,
        imageType,
        event: updatedEvent
      }
    });
  } catch (error) {
    console.error('Error uploading event image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload event image',
      error: error.message
    });
  }
};

/**
 * Upload offer image
 */
const uploadOfferImage = async (req, res) => {
  try {
    const { eventId, offerId } = req.params;
    
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
      return;
    }
    
    // Check if event exists
    const event = await Event.findOne({ eventId });
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }
    
    // Check if offer exists
    const offer = event.offers?.find(o => o._id?.toString() === offerId);
    if (!offer) {
      res.status(404).json({
        success: false,
        message: 'Offer not found in this event'
      });
      return;
    }
    
    // Upload the image using our utility
    const fileName = `offer-${eventId}-${offerId}-${Date.now()}.${req.file.originalname.split('.').pop()}`;
    const imageUrl = await uploadImage(req.file.buffer, fileName, 'events/offers');
    
    // Update the offer with the new image URL
    const updatedEvent = await Event.findOneAndUpdate(
      { eventId, 'offers._id': offerId },
      { $set: { 'offers.$.imageUrl': imageUrl } },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Offer image uploaded successfully',
      data: {
        imageUrl,
        event: updatedEvent
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
  createEvent: createEvent,
  getAllEvents: getAllEvents,
  getEventById: getEventById,
  updateEvent: updateEvent,
  deleteEvent: deleteEvent,
  toggleEventStatus: toggleEventStatus,
  getEventRegistrations: getEventRegistrations,
  uploadEventImage: uploadEventImage,
  uploadOfferImage: uploadOfferImage
};