const mongoose = require('mongoose');
const { Schema } = mongoose;

const EventItemSchema = new Schema({
  itemName: { 
    type: String, 
    required: true 
  },
  itemDescription: { 
    type: String, 
    required: true 
  },
  itemPrice: { 
    type: Number, 
    required: true 
  },
  itemCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodCategory',
    required: true,
  },
  eventId: { 
    type: String, 
    required: true,
    ref: 'Event'
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

EventItemSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('EventItem', EventItemSchema);