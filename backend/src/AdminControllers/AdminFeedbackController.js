const Feedback = require('../models/FeedbackModel.js');
const mongoose = require('mongoose');
const { adminAuth } = require('../middlewares/adminAuth.js');
const { deleteImage } = require('../utils/imageUploads.js');

/**
 * Get all feedback
 */
const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
};

/**
 * Get feedback by ID
 */
const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid feedback ID'
      });
      return;
    }
    
    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
};

/**
 * Delete feedback
 */
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid feedback ID'
      });
      return;
    }
    
    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
      return;
    }
    
    await Feedback.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback',
      error: error.message
    });
  }
};

module.exports = {
  getAllFeedback: getAllFeedback,
  getFeedbackById: getFeedbackById,
  deleteFeedback: deleteFeedback
};