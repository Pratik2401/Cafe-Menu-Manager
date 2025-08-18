const mongoose = require('mongoose');
const { Schema } = mongoose;

const FeedbackSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  feedback: { 
    type: String, 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Feedback = mongoose.model('Feedback', FeedbackSchema);
module.exports = Feedback;