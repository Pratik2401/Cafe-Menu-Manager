const Event = require('../models/EventModel.js');
const EventRegistration = require('../models/EventRegistrationModel.js');
// const User = require('../models/UserModel.js');
const mongoose = require('mongoose');

/**
 * Get all active events
 */
const getActiveEvents = async (req, res) => {
  try {
    // Get all active events and filter by IST time in application
    const events = await Event.find({ isActive: true }).sort({ startDate: 1 });
    
    // Filter events that haven't ended yet using IST time
    const currentIST = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const currentISTDate = new Date(currentIST);
    
    const activeEvents = events.filter(event => {
      const eventEndDate = new Date(event.endDate);
      return eventEndDate >= currentISTDate;
    });
    
    res.status(200).json({
      success: true,
      data: activeEvents
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