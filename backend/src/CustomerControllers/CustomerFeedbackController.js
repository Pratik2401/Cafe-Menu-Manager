const Feedback = require('../models/FeedbackModel.js');

/**
 * Create new feedback
 */
const createFeedback = async (req, res) => {
  try {
    const { name, mobile, feedback, rating } = req.body;

    // Validate required fields
    if (!name || !mobile || !feedback || !rating) {
      res.status(400).json({
        success: false,
        message: 'Name, mobile, feedback and rating are required'
      });
      return;
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
      return;
    }

    // Create new feedback
    const newFeedback = new Feedback({
      name,
      mobile,
      feedback,
      rating
    });

    await newFeedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback created successfully',
      data: newFeedback
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create feedback',
      error: error.message
    });
  }
};

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

module.exports = {
  createFeedback,
  getAllFeedback,
  getFeedbackById
};