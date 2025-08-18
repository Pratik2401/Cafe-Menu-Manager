const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const FoodCategorySchema = new Schema({
  name: { 
    type: String, 
    required: true,
    unique: true
  },
  icon: { 
    type: String, 
    required: true 
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

const FoodCategory = model('FoodCategory', FoodCategorySchema);
module.exports = FoodCategory;