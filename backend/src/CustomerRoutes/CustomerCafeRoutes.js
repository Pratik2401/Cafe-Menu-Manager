const express = require('express');
const { getCafe, getCafeSettings, updateCardColors } = require('../CustomerControllers/CustomerCafeController');

const router = express.Router();

// Get the cafe details
router.get('/', getCafe);

// Get cafe settings for customer-facing pages
router.get('/settings', getCafeSettings);

// Update card colors
router.put('/settings/card-colors', updateCardColors);

module.exports = router;