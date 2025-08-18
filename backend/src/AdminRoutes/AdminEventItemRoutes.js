const express = require('express');
const {
  createEventItem,
  getAllEventItems,
  getEventItemById,
  updateEventItem,
  deleteEventItem,
  toggleEventItemStatus
} = require('../AdminControllers/AdminEventItemController.js');
// const adminAuth = require('../middlewares/adminAuth.js');

const router = express.Router();

// Public routes
router.get('/', getAllEventItems);
router.get('/:id', getEventItemById);

// Protected routes (admin only)
router.post('/', createEventItem);
router.put('/:id', updateEventItem);
router.delete('/:id', deleteEventItem);
router.patch('/:id/toggle', toggleEventItemStatus);

module.exports = router;
