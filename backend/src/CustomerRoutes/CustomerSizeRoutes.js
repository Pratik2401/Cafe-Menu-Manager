const express = require('express');
const CustomerSizeController = require('../CustomerControllers/CustomerSizeController');

const router = express.Router();

// Size read-only routes for customers
router.get('/', CustomerSizeController.getAllSizes);
router.get('/:id', CustomerSizeController.getSizeById);

module.exports = router;