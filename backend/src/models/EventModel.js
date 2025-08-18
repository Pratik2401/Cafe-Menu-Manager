const mongoose = require('mongoose');
const { Schema } = mongoose;

const OfferItemSchema = new Schema({
  itemId: { type: String, required: true },
  name: { 
    type: String, 
    required: true
  },
  quantity: { type: Number, default: 1 }
});

const OfferSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  items: [OfferItemSchema],
  regularPrice: { type: Number },
  offerPrice: { type: Number }
});

const EventSchema = new Schema({
  eventId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  maxAttendees: {
    type: Number
  },
  currentAttendees: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  eventImageUrl: {
    type: String
  },
  promotionalImageUrl: {
    type: String
  },
  tags: {
    type: [String]
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
  entryType: {
    type: String,
    enum: ['free', 'cover', 'ticket'],
    default: 'free'
  },
  price: {
    type: Number,
    default: 0
  },
  isAgeRestricted: {
    type: Boolean,
    default: false
  },
  offers: [OfferSchema],
  registrationFormUrl: {
    type: String
  }
}, { timestamps: true });

EventSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    if (ret.isAgeRestricted === undefined) {
      ret.isAgeRestricted = false;
    }
    
    if (ret.offers) {
      ret.offers = ret.offers.map((offer) => {
        if (offer.items) {
          offer.items = offer.items.map((item) => {
            if (!item.name) {
              item.name = "Unnamed Item";
            }
            return item;
          });
        }
        return offer;
      });
    }
    return ret;
  }
});

module.exports = mongoose.model('Event', EventSchema);