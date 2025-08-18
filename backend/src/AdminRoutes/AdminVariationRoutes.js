const express = require('express');
const {
  createVariation,
  getAllVariations,
  getVariationById,
  updateVariation,
  deleteVariation,
  toggleVariationStatus
} = require('../AdminControllers/AdminVariationController.js');

const router = express.Router();

// Create a new variation
router.post('/', createVariation);

// Get all variations
router.get('/', getAllVariations);

// Get variation by ID
router.get('/:id', getVariationById);

// Update variation
router.put('/:id', updateVariation);

// Delete variation
router.delete('/:id', deleteVariation);

// Toggle variation status
router.patch('/:id/toggle-status', toggleVariationStatus);

module.exports = router;