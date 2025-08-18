const express = require('express');
const { 
  getActiveEvents, 
  getEventById
} = require('../CustomerControllers/CustomerEventController');

const router = express.Router();

/**
 * Customer-facing event routes
 * No authentication required as these are public endpoints
 */

// Get all active events
router.get('/', getActiveEvents);

// Get event by ID
router.get('/:eventId', getEventById);

module.exports = router;