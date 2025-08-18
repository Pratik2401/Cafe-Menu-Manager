const mongoose = require('mongoose');
const { Schema } = mongoose;

const OfferItemSchema = new Schema({
  item: { 
    type: Schema.Types.ObjectId, 
    ref: 'Item',
    required: false
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 1,
    default: 1
  },
  name: { 
    type: String 
  },
  description: {
    type: String
  },
  price: {
    type: Number
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  }
});

const NestedOfferSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  actualPrice: { 
    type: Number, 
    required: true 
  },
  offerPrice: { 
    type: Number, 
    required: true 
  },
  imageUrl: { 
    type: String 
  },
  items: [OfferItemSchema]
});

const DailyOfferSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  backgroundImage: { 
    type: String, 
    required: true 
  },
  promotionalImage: {
    type: String
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  startTime: { 
    type: String, 
    required: true 
  },
  endTime: { 
    type: String, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: {
      frequency: {
        type: String,
        enum: ['weekly', 'monthly'],
        required: function() { return this.parent().isRecurring; }
      },
      dayOfWeek: {
        type: Number,
        min: 0,
        max: 6,
        required: function() { return this.parent().isRecurring && this.parent().frequency === 'weekly'; }
      },
      dayOfMonth: {
        type: Number,
        min: 1,
        max: 31,
        required: function() { return this.parent().isRecurring && this.parent().frequency === 'monthly'; }
      },
      endRecurrence: {
        type: Date
      }
    },
    required: function() { return this.isRecurring; }
  },
  offers: [NestedOfferSchema]
}, { timestamps: true });

DailyOfferSchema.pre('validate', function(next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});

module.exports = mongoose.model('DailyOffer', DailyOfferSchema);