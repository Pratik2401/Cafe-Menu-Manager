/**
 * @fileoverview Item Model for TopchiOutpost Cafe Management System
 * 
 * This model defines the structure for menu items with complex pricing,
 * variations, add-ons, and field visibility controls. It supports
 * size-based pricing, customizable variations, and dynamic field management.
 * 
 * @author TopchiOutpost Development Team
 * @version 1.0.0
 * @since 2025-01-01
 * 
 * @requires mongoose - MongoDB object modeling
 */

const mongoose = require('mongoose');
const { Document, Schema, Model } = mongoose;

/**
 * @typedef {Object} SizePrice
 * @description Schema for size-specific pricing
 * @property {ObjectId} sizeId - Reference to Size model
 * @property {number} price - Price for this size
 */
const SizePriceSchema = new Schema({
  sizeId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Size',
    required: true 
  },
  price: { type: Number, required: true },
});

/**
 * @typedef {Object} AddonPrice
 * @description Schema for add-on pricing with variation and size considerations
 * @property {ObjectId} variationId - Reference to Variation model (optional)
 * @property {ObjectId} sizeId - Reference to Size model (optional)
 * @property {number} price - Price for this add-on combination
 */
const AddonPriceSchema = new Schema({
  variationId: {
    type: Schema.Types.ObjectId,
    ref: 'Variation'
  },
  sizeId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Size'
  },
  price: { type: Number, required: true },
});

/**
 * @typedef {Object} VariationSizePrice
 * @description Schema for variation pricing by size
 * @property {ObjectId} sizeId - Reference to Size model
 * @property {number} price - Additional price for this variation + size combination
 */
const VariationSizePriceSchema = new Schema({
  sizeId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Size',
    required: true 
  },
  price: { type: Number, required: true },
});

/**
 * @typedef {Object} ItemVariation
 * @description Schema for item variations (e.g., decaf, oat milk, etc.)
 * @property {ObjectId} variationId - Reference to Variation model
 * @property {number} [price] - Base price adjustment for variation
 * @property {Array<VariationSizePrice>} sizePrices - Size-specific pricing for variation
 * @property {boolean} isAvailable - Availability status for this variation
 */
const ItemVariationSchema = new Schema({
  variationId: {
    type: Schema.Types.ObjectId,
    ref: 'Variation',
    required: true
  },
  price: {
    type: Number,
    // Only required when no sizePrices are provided
    required: function() {
      return !this.sizePrices || this.sizePrices.length === 0;
    }
  },
  sizePrices: {
    type: [VariationSizePriceSchema],
    default: []
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
});

/**
 * @typedef {Object} AddOn
 * @description Schema for item add-ons (e.g., extra shot, whipped cream)
 * @property {string} addOnItem - Name/description of the add-on
 * @property {number} price - Base price for the add-on (backward compatibility)
 * @property {Array<AddonPrice>} prices - Complex pricing for variations/sizes
 * @property {boolean} isMultiSelect - Whether multiple quantities can be selected
 */
const AddOnSchema = new Schema({
  addOnItem: { type: String, required: true },
  price: { type: Number, required: true }, // Direct price for backward compatibility
  prices: [AddonPriceSchema], // Variation and size-specific prices
  isMultiSelect: { type: Boolean, default: false },
});

/**
 * @typedef {Object} FieldVisibility
 * @description Schema for controlling which fields are displayed to customers
 * @property {boolean} description - Whether to show item description
 * @property {boolean} image - Whether to show item image
 * @property {boolean} addOns - Whether to show add-ons section
 */
const FieldVisibilitySchema = new Schema({
  description: { type: Boolean, default: true },
  image: { type: Boolean, default: true },
  addOns: { type: Boolean, default: true },
});

/**
 * @typedef {Object} Item
 * @description Main schema for menu items
 * @property {string} name - Item name (required)
 * @property {string} [description] - Item description
 * @property {number} price - Base price (required)
 * @property {string} [image] - Image URL/path
 * @property {ObjectId} [foodCategory] - Reference to FoodCategory
 * @property {ObjectId} subCategory - Reference to SubCategory (required)
 * @property {Array<ObjectId>} tags - Array of Tag references (max 2)
 * @property {Array<AddOn>} addOns - Available add-ons for this item
 * @property {Array<SizePrice>} sizePrices - Size-specific pricing
 * @property {Array<ItemVariation>} variations - Available variations
 * @property {boolean} hasVariations - Flag indicating if item has variations
 * @property {number} serialId - Serial ID for ordering within subcategory
 * @property {Date} createdAt - Creation timestamp
 * @property {boolean} show - Visibility flag for customers
 * @property {FieldVisibility} fieldVisibility - Field display controls
 */
const ItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  foodCategory: { type: Schema.Types.ObjectId, ref: 'FoodCategory' },
  subCategory: { type: Schema.Types.ObjectId, ref: 'SubCategory', required: true },
  tags: {
    type: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Tag'
    }],
    validate: [
      {
        validator: function(tags) {
          return tags.length <= 2;
        },
        message: 'An item can have at most 2 tags'
      }
    ]
  },
  addOns: {
    type: [AddOnSchema],
    default: []
  },
  sizePrices: {
    type: [SizePriceSchema],
    default: []
  },
  variations: {
    type: [ItemVariationSchema],
    default: []
  },
  hasVariations: {
    type: Boolean,
    default: false
  },
  serialId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },

  show: { type: Boolean, default: true },
  fieldVisibility: { type: FieldVisibilitySchema, default: () => ({}) },
});

/**
 * Utility function to check if a field is empty or null
 * @param {*} value - Value to check
 * @returns {boolean} True if field is considered empty
 */
function isEmptyField(value) {
  return (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0)
  );
}

/**
 * Apply field visibility overrides to this item
 * @description Updates field visibility based on provided overrides and field content
 * @param {Object} overrides - Visibility override settings
 * @async
 */
ItemSchema.methods.applyFieldVisibilityOverrides = async function (overrides) {
  if (!overrides) return;

  const newVis = {
    description: overrides.description === true && !isEmptyField(this.description),
    image: overrides.image === true && !isEmptyField(this.image),
    addOns: overrides.addOns === true && !isEmptyField(this.addOns),
  };

  this.fieldVisibility = newVis;
  await this.save();
};

/**
 * Sync field visibility from parent subcategory settings
 * @description Inherits visibility settings from parent subcategory
 * @async
 */
ItemSchema.methods.syncFieldVisibilityFromSubCategory = async function () {
  if (!this.populated('subCategory')) {
    await this.populate('subCategory');
  }
  const subVis = this.subCategory?.fieldVisibility || {};

  if (subVis) {
    this.fieldVisibility = {
      description: !!subVis.description && !isEmptyField(this.description),
      image: !!subVis.image && !isEmptyField(this.image),
      addOns: !!subVis.addOns && !isEmptyField(this.addOns),
    };
  }
};

/**
 * Pre-validation middleware to handle add-ons data transformation
 * @description Parses stringified JSON add-ons data and ensures array format
 */
ItemSchema.pre('validate', function(next) {
  if (typeof this.addOns === 'string') {
    try {
      this.addOns = JSON.parse(this.addOns);
    } catch (e) {
      this.addOns = [];
    }
  }
  
  if (!Array.isArray(this.addOns)) {
    this.addOns = [];
  }
  
  next();
});

/**
 * Item model for menu items
 * @type {mongoose.Model<Item>}
 */
const Item = mongoose.model('Item', ItemSchema);
module.exports = Item;