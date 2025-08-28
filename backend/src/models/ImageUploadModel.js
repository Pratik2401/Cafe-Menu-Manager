const mongoose = require('mongoose');

const ImageUploadSchema = new mongoose.Schema({
  imageUrl: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: false,
    default: '' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ImageUpload', ImageUploadSchema);