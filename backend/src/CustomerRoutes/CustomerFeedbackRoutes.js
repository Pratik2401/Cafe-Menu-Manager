const express = require('express');
const {
  createFeedback
} = require('../CustomerControllers/CustomerFeedbackController');

const router = express.Router();

// Create new feedback
router.post('/', createFeedback);

module.exports = router;