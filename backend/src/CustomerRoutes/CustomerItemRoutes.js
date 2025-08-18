const express = require('express');
const router = express.Router();

const {
  getAllItems,
  getItemById,
} = require('../CustomerControllers/CustomerItemController');

/**
 * @route   GET /api/items
 * @desc    Get all items (with optional filters)
 */
router.get('/', getAllItems);

/**
 * @route   GET /api/items/:id
 * @desc    Get a single item by ID
 */
router.get('/:id', getItemById);

module.exports = router;