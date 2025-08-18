/**
 * @fileoverview Server entry point for TopchiOutpost Cafe Management System
 * 
 * This file initializes the Express server, establishes database connection,
 * and handles graceful startup/shutdown procedures. It serves as the main
 * entry point for the entire backend application.
 * 
 * @author TopchiOutpost Development Team
 * @version 1.0.0
 * @since 2025-01-01
 * 
 * @requires dotenv - For environment variable management
 * @requires ./app.js - Main Express application configuration
 * @requires ./src/config/dbconfig.js - Database connection configuration
 */

// Load environment variables from .env file
require('dotenv').config();

const app = require('./app.js');
const connectDB = require('./src/config/dbconfig.js');

// Server configuration
const PORT = process.env.PORT || 3000;

/**
 * Application startup sequence
 * @description Initializes database connection and starts the HTTP server
 * @async
 */
(async () => {
  try {
    // Attempt database connection
    await connectDB();
    console.log('✅ Connected to the database');
  } catch (err) {
    // Log error but continue in offline mode for development
    console.error('❌ Failed to connect to DB:', err);
    console.warn('⚠️ Running in offline mode. Some features may be unavailable.');
  }

  // Start HTTP server
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
})();