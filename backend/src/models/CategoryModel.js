const { Schema, model } = require('mongoose');
const Admin = require('./AdminModel.js'); // Import the Admin model

const CategorySchema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  serialId: { type: Number, required: true },
  isVisible: { type: Boolean, default: true }, // Default visibility is true
  gstRate: { type: Number, default: null }, // Default GST rate is null (not specified)
  isAgeRestricted: { type: Boolean, default: false }, // 21+ age restriction
});

// Add a virtual field for `orderAllowed`
CategorySchema.virtual('orderAllowed').get(async function () {
  const admin = await Admin.findOne(); // Fetch the admin settings (assuming a single admin setup)
  return admin ? admin.allowOrdering : true; // Default to true if no admin settings are found
});

const Category = model('Category', CategorySchema);
module.exports = Category;