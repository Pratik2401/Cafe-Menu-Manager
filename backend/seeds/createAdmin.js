/**
 * @fileoverview Admin User Seed Script
 * Creates an admin user with predefined credentials for TopchiOutpost system
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../src/models/AdminModel');
const Cafe = require('../src/models/CafeModel');
const { connectDB } = require('../src/config/dbconfig');

/**
 * Create admin user with specified credentials
 */
const createAdmin = async () => {
  try {
    // Connect to database
    await connectDB();
    
    const adminEmail = 'pratik242005@gmail.com';
    const adminPassword = 'Snap2Eat@2025';
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('❌ Admin user already exists with this email');
      process.exit(1);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Create admin user
    const admin = new Admin({
      email: adminEmail,
      password: hashedPassword,
      gstIncluded: false,
      cgst: 9,
      sgst: 9,
      allowOrdering: true,
      tables: new Map()
    });
    
    await admin.save();
    
    // Check if cafe settings already exist
    const existingCafe = await Cafe.findOne();
    if (!existingCafe) {
      // Create default cafe settings
      const cafe = new Cafe({
        name: 'Snap2Eat Cafe',
        location: 'Default Location',
        gstIncluded: false,
        cgst: 9,
        sgst: 9,
        allowOrdering: true,
        features: {
          ordersToggle: false,
          eventsToggle: false,
          dailyOfferToggle: true,
          imageUploadsToggle: false
        }
      });
      
      await cafe.save();
      console.log('✅ Default cafe settings created successfully');
    }
    
    console.log('✅ Admin user created successfully');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

// Run the seed function
createAdmin();