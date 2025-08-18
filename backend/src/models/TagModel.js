const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const TagSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    unique: true
  },
  color: { 
    type: String, 
    enum: ['#E3F2FD', '#1565C0', '#FFF3E0', '#EF6C00', '#FFEBEE', '#C62828', '#E8F5E9', '#2E7D32', '#F3E5F5', '#6A1B9A', '#F9FBE7', '#9E9D24']
  },
  image: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Validation to ensure either color or image is provided
TagSchema.pre('save', function(next) {
  if (!this.color && !this.image) {
    next(new Error('Either color or image must be provided'));
  } else {
    next();
  }
});

const Tag = model('Tag', TagSchema);
module.exports = Tag;