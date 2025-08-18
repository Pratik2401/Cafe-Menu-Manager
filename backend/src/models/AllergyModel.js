const mongoose = require('mongoose');
const { Schema } = mongoose;

const AllergySchema = new Schema({
  name: { 
    type: String, 
    required: true,
    unique: true
  },
  image: { 
    type: String, 
    required: true 
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Allergy = mongoose.model('Allergy', AllergySchema);
module.exports = Allergy;