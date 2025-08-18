const express = require('express');
const {
  getAllVariations,
  getVariationById
} = require('../CustomerControllers/CustomerVariationController.js');

const router = express.Router();

// Get all active variations
router.get('/', getAllVariations);

// Get variation by ID
router.get('/:id', getVariationById);

module.exports = router;