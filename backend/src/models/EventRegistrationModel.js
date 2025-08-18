const mongoose = require('mongoose');
const { Schema } = mongoose;

const EventRegistrationSchema = new Schema({
  registrationId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  event: { 
    type: Schema.Types.ObjectId, 
    ref: 'Event',
    required: true 
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  registeredAt: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ['confirmed', 'cancelled', 'waitlisted'],
    default: 'confirmed' 
  },
  notes: { 
    type: String 
  }
});

EventRegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('EventRegistration', EventRegistrationSchema);