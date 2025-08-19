/**
 * @fileoverview Optimized Database Configuration for TopchiOutpost Cafe Management System
 * 
 * This module provides production-ready MongoDB connection with connection pooling,
 * optimized settings for performance, and proper error handling.
 * 
 * @author TopchiOutpost Development Team
 * @version 2.0.0
 * @since 2025-01-01
 */

const mongoose = require('mongoose');

/**
 * Database connection configuration with production optimizations
 * @description Establishes MongoDB connection with connection pooling and performance settings
 * @async
 * @returns {Promise<void>} Resolves when connection is established
 * @throws {Error} When connection fails or URI is missing
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  try {
    // Connection options optimized for production
    const options = {
      // Connection Pool Settings
      maxPoolSize: 10,        // Maximum number of connections in the pool
      minPoolSize: 5,         // Minimum number of connections to maintain
      maxIdleTimeMS: 30000,   // Close connections after 30 seconds of inactivity
      
      // Performance Settings
      serverSelectionTimeoutMS: 5000,  // How long to try selecting a server
      socketTimeoutMS: 45000,          // How long to wait for a response
      bufferCommands: false,           // Disable mongoose buffering for commands
      
      // Connection Management
      heartbeatFrequencyMS: 10000,     // How often to check server status
      retryWrites: true,               // Retry failed writes
      w: 'majority',                   // Write concern for data safety
      
      // Index Management
      autoIndex: process.env.NODE_ENV !== 'production', // Auto-create indexes in dev only
      autoCreate: process.env.NODE_ENV !== 'production', // Auto-create collections in dev only
    };

    await mongoose.connect(uri, options);
    console.log('✅ Connected to MongoDB with optimized settings');
    
    // Log connection pool status
    const db = mongoose.connection.db;
    console.log(`📊 Connection pool configured: max=${options.maxPoolSize}, min=${options.minPoolSize}`);
    
    // Set up connection event listeners for monitoring
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown handlers
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

/**
 * Create database indexes for optimal query performance
 * @description Creates compound indexes for frequently accessed data patterns
 * @async
 * @returns {Promise<void>} Resolves when all indexes are created
 */
const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Items Collection Indexes - Most frequently queried
    await db.collection('items').createIndex({ 
      categoryId: 1, 
      subCategoryId: 1, 
      isVisible: 1, 
      serialId: 1 
    }, { 
      name: 'items_category_visibility_idx',
      background: true 
    });
    
    await db.collection('items').createIndex({ 
      'tags': 1, 
      isVisible: 1 
    }, { 
      name: 'items_tags_visibility_idx',
      background: true 
    });

    await db.collection('items').createIndex({ 
      name: 'text', 
      description: 'text' 
    }, { 
      name: 'items_text_search_idx',
      background: true 
    });

    // Categories Collection Indexes
    await db.collection('categories').createIndex({ 
      isVisible: 1, 
      serialId: 1 
    }, { 
      name: 'categories_visibility_order_idx',
      background: true 
    });

    // SubCategories Collection Indexes
    await db.collection('subcategories').createIndex({ 
      categoryId: 1, 
      isVisible: 1, 
      serialId: 1 
    }, { 
      name: 'subcategories_category_visibility_idx',
      background: true 
    });

    // Daily Offers Collection Indexes
    await db.collection('dailyoffers').createIndex({ 
      isActive: 1, 
      startDate: 1, 
      endDate: 1 
    }, { 
      name: 'dailyoffers_active_date_idx',
      background: true 
    });

    // Events Collection Indexes
    await db.collection('events').createIndex({ 
      isActive: 1, 
      startDate: 1, 
      endDate: 1 
    }, { 
      name: 'events_active_date_idx',
      background: true 
    });

    // Feedback Collection Indexes
    await db.collection('feedbacks').createIndex({ 
      createdAt: -1 
    }, { 
      name: 'feedback_created_date_idx',
      background: true 
    });

    // User Info Collection Indexes (for analytics)
    await db.collection('userinfos').createIndex({ 
      createdAt: -1 
    }, { 
      name: 'userinfo_created_date_idx',
      background: true 
    });

    console.log('📈 Database indexes created successfully');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
};

module.exports = { connectDB, createIndexes };
