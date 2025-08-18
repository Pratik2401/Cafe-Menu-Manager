const express = require('express');
const {
  getAllFeedback,
  getFeedbackById,
  deleteFeedback
} = require('../AdminControllers/AdminFeedbackController.js');

const router = express.Router();

// Get all feedback
router.get('/', getAllFeedback);

// Get feedback by ID
router.get('/:id', getFeedbackById);

// Delete feedback
router.delete('/:id', deleteFeedback);

module.exports = router;
