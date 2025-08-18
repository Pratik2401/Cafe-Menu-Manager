const express = require('express');
const upload = require('../middlewares/uploadMiddleware.js');

const router = express.Router();

const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  updateItemAvailability,
  updateItemSerials
} = require('../AdminControllers/AdminItemController.js');
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

/**
 * @route   POST /api/items
 * @desc    Create a new item
 */
router.post('/', upload.single('image'), createItem);



router.put('/update-serials', updateItemSerials);

/**
 * @route   PUT /api/items/:id
 * @desc    Update an existing item
 */
router.put('/:id', upload.single('image'), updateItem);

/**
 * @route   DELETE /api/items/:id
 * @desc    Delete an items
 */
router.delete('/:id', deleteItem);

/**
 * @route   PUT /api/items/:id/availability
 * @desc    Update availability of an item (toggle available/unavailable)
 */
router.put('/:id/availability', updateItemAvailability);
module.exports = router;
