const mongoose = require('mongoose');

const userInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  number: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  birthday: {
    type: Date
  },
  optIn: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserInfo', userInfoSchema);