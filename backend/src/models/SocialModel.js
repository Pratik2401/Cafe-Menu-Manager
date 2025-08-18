const mongoose = require('mongoose');
const { Document, Schema } = mongoose;

const SocialSchema = new Schema({
  platform: {
    type: String,
    enum: ['Instagram', 'WhatsApp', 'Google', 'Mobile Number', 'Email', 'Maps', 'Website'],
    required: true,
  },
  cafeName: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  location: {
    address: String,
    latitude: Number,
    longitude: Number,
    mapUrl: String
  },
  customImage: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('Social', SocialSchema);