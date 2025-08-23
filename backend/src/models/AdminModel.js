const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  tables: {
    type: Map,
    of: Boolean, // Each table (e.g., D1, D2) will have a boolean value
    default: {}, // Default to an empty map
  },
  gstIncluded: { type: Boolean, default: false }, // GST included or excluded
  cgst: { type: Number, default: 0 }, // CGST percentage (if GST is excluded)
  sgst: { type: Number, default: 0 }, // SGST percentage (if GST is excluded)
  allowOrdering: { type: Boolean, default: true }, // Allow ordering or close
  features: {
    ordersToggle: { type: Boolean, default: false },
    eventsToggle: { type: Boolean, default: false },
    dailyOfferToggle: { type: Boolean, default: false }
  }
}, { timestamps: true });

const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;