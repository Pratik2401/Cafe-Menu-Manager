const express = require('express');
const {
  getActiveDailyOffers,
  getDailyOfferById
} = require('../CustomerControllers/CustomerDailyOfferController');

const router = express.Router();

// Get all active daily offers
router.get('/', getActiveDailyOffers);

// Get daily offer by ID
router.get('/:id', getDailyOfferById);

module.exports = router;