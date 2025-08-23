/**
 * @fileoverview Seed Script to Add Features to Existing Admins
 * Updates all admin entries missing the 'features' field with default values
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../src/models/AdminModel');
const { connectDB } = require('../src/config/dbconfig');

const DEFAULT_FEATURES = {
  ordersToggle: false,
  eventsToggle: true,
  dailyOfferToggle: true
};

const addFeaturesToAdmins = async () => {
  try {
    await connectDB();
    // Update all admins to have the new features enabled
    const result = await Admin.updateMany(
      {},
      { $set: { features: DEFAULT_FEATURES } }
    );
    console.log(`✅ Updated ${result.modifiedCount} admin(s) with features enabled.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admins:', error.message);
    process.exit(1);
  }
};

addFeaturesToAdmins();
