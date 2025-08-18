const Event = require('../models/EventModel.js');
const EventRegistration = require('../models/EventRegistrationModel.js');
// const User = require('../models/UserModel.js');
const mongoose = require('mongoose');

/**
 * Get all active events
 */
const getActiveEvents = async (req, res) => {
  try {
    // Get only active events that haven't ended yet
    const currentDate = new Date();
    const events = await Event.find({
      isActive: true,
      endDate: { $gte: currentDate }
    }).sort({ startDate: 1 });
    
    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching active events:', error);
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
    
    const event = await Event.findOne({ eventId, isActive: true });
    
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found or inactive'
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

module.exports = {
  getActiveEvents,
  getEventById
};