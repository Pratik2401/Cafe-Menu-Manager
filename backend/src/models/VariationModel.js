const mongoose = require('mongoose');
const { Schema } = mongoose;

const VariationSchema = new Schema({
  name: { 
    type: String, 
    required: true
  },
  description: { 
    type: String 
  },
  isActive: {
    type: Boolean,
    default: true
  },
  group: { 
    type: String, 
    default: 'Default',
    index: true
  }, // Group name for organizing variations
}, { timestamps: true });

// Create a compound index on name and group to ensure uniqueness within a group
VariationSchema.index({ name: 1, group: 1 }, { unique: true });

// Drop any existing single-field unique index on name if it exists
const Variation = mongoose.model('Variation', VariationSchema);

// This will run when the application starts to ensure the index is properly set up
const setupIndexes = async () => {
  try {
    // Drop the old index if it exists
    await Variation.collection.dropIndex('name_1').catch(err => {
      // Ignore error if index doesn't exist
      if (err.code !== 27) console.error('Error dropping index:', err);
    });
    console.log('Successfully set up variation indexes');
  } catch (error) {
    console.error('Error setting up variation indexes:', error);
  }
};

// Execute the setup
setupIndexes();

module.exports = Variation;