const mongoose = require('mongoose');
const { Document, Schema, Model } = mongoose;

const SizeSchema = new Schema({
  name: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  enabled: { type: Boolean, default: true },
  group: { 
    type: String, 
    default: 'Default',
    index: true
  }, // Group name for organizing sizes
}, { timestamps: true });

SizeSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Create a compound index on name and group to ensure uniqueness within a group
SizeSchema.index({ name: 1, group: 1 }, { unique: true });

// Drop any existing single-field unique index on name if it exists
const Size = mongoose.model('Size', SizeSchema);

// This will run when the application starts to ensure the index is properly set up
const setupIndexes = async () => {
  try {
    // Drop the old index if it exists
    await Size.collection.dropIndex('name_1').catch(err => {
      // Ignore error if index doesn't exist
      if (err.code !== 27) console.error('Error dropping index:', err);
    });
    console.log('Successfully set up size indexes');
  } catch (error) {
    console.error('Error setting up size indexes:', error);
  }
};

// Execute the setup
setupIndexes();

module.exports = Size;