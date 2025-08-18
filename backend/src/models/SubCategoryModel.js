const mongoose = require('mongoose');

const SubCategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },

  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },

  serialId: { 
    type: Number, 
    required: true
  },

  isVisible: {
    type: Boolean,
    default: true
  },

  taxType: {
    type: String,
    enum: ['VAT', 'GST'],
    default: 'GST'
  },

  taxRate: {
    type: Number,
    default: null
  },
  
  notes: [{
    heading: {
      type: String,
      required: true
    },
    content: {
      type: String,
      default: ''
    },
    position: {
      type: String,
      enum: ['header', 'footer'],
      default: 'footer'
    }
  }],

  fieldVisibility: {
    description: { type: Boolean, default: true },
    image: { type: Boolean, default: true },
    addOns: { type: Boolean, default: true },
  }
});

module.exports = mongoose.model('SubCategory', SubCategorySchema);