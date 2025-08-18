const express = require('express');
const { 
  createEvent, 
  getAllEvents, 
  getEventById, 
  updateEvent, 
  deleteEvent, 
  toggleEventStatus, 
  getEventRegistrations,
  uploadEventImage,
  uploadOfferImage
} = require('../AdminControllers/AdminEventController.js');
const upload = require('../middlewares/uploadMiddleware.js');
// const adminAuth = require('../middlewares/adminAuth.js');
const router = express.Router();

/**
 * Event management routes
 * All routes are protected by admin authentication
 */

// Create a new event
router.post('/',  createEvent);

// Get all events
router.get('/', getAllEvents);

// Get event by ID
router.get('/:eventId', getEventById);

// Update event
router.put('/:eventId', updateEvent);

// Delete event
router.delete('/:eventId', deleteEvent);

// Toggle event active status
router.patch('/:eventId/toggle-status', toggleEventStatus);

// Get event registrations
router.get('/:eventId/registrations', getEventRegistrations);

// Upload event image (event or promotional)
router.post('/:eventId/upload-image', upload.single('image'), uploadEventImage);

// Upload promotional image (alternative endpoint for clarity)
router.post('/:eventId/upload-promotional-image', upload.single('image'), (req, res, next) => {
  req.body.imageType = 'promotional';
  uploadEventImage(req, res, next);
});

// Upload offer image
router.post('/:eventId/offers/:offerId/upload-image', upload.single('image'), uploadOfferImage);
module.exports = router;
