const mongoose = require('mongoose');

const CafeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Cafe name
  location: { type: String }, // Cafe location
  imageUrl: { type: String, default: '' }, // Cafe image URL
  backgroundImageUrl: { type: String, default: '' }, // Background image URL for landing and menu pages
  tables: {
    type: Map,
    of: Boolean, // Each table (e.g., T1, T2) will have a boolean value
    default: {}, // Default to an empty map
  },
  gstIncluded: { type: Boolean, default: false }, // GST included or excluded
  cgst: { type: Number, default: 0 }, // CGST percentage (if GST is excluded)
  sgst: { type: Number, default: 0 }, // SGST percentage (if GST is excluded)
  allowOrdering: { type: Boolean, default: true }, // Allow ordering or close
  radius: { type: Number, default: 0 }, // Radius of the cafe (e.g., for delivery or coverage area)
  // Menu customization options
  menuCustomization: {
    cssVariables: {
      '--bg-primary': { type: String, default: '#FEF8F3' },     // Main background
      '--bg-secondary': { type: String, default: '#FEAD2E' },   // Headers, active elements
      '--bg-tertiary': { type: String, default: '#383838' },    // Accents, hover states
      '--color-dark': { type: String, default: '#383838' },     // Primary text
      '--color-accent': { type: String, default: '#FEAD2E' },   // Highlights, active elements
      '--color-secondary': { type: String, default: '#666666' }, // Secondary text
      '--card-bg': { type: String, default: '#FFFFFF' },        // Card background color
      '--card-text': { type: String, default: '#000000' },      // Card text color
    },
    logoUrl: { type: String, default: '' }, // Logo URL
    logoBackgroundColor: { type: String, default: '#FFFFFF' }, // Logo background color
    backgroundImage: { type: String, default: '' }, // Background image for menu page
  },
  // Custom messages for user interface
  customMessages: {
    noItemsText: { type: String, default: 'No items available' },
    noCategoryText: { type: String, default: 'No categories available' },
    loadingText: { type: String, default: 'Loading...' }
  },
  // Feature toggles
  features: {
    eventsToggle: { type: Boolean, default: true },
    dailyOfferToggle: { type: Boolean, default: true },
    ordersToggle: { type: Boolean, default: false }
  },
}, { timestamps: true });

const Cafe = mongoose.model('Cafe', CafeSchema);
module.exports = Cafe;