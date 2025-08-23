const mongoose = require('mongoose');
const { Document, Schema } = mongoose;

const SocialSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  serialId: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Social', SocialSchema);