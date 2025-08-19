/**
 * @fileoverview Optimized Server Entry Point for TopchiOutpost Cafe Management System
 * 
 * This file initializes the Express server with production optimizations,
 * establishes database connection with connection pooling, creates indexes,
 * and handles graceful startup/shutdown procedures.
 * 
 * @author TopchiOutpost Development Team
 * @version 2.0.0
 * @since 2025-01-01
 */

// Load environment variables from .env file
require('dotenv').config();

const app = require('./app.js');
const { connectDB, createIndexes } = require('./src/config/dbconfig.js');
const { cache } = require('./src/config/cache.js');
const { warmCache } = require('./src/middlewares/caching.js');

// Server configuration
const PORT = process.env.PORT || 3000;

/**
 * Application startup sequence with optimizations
 * @description Initializes database connection, creates indexes, warms cache, and starts server
 * @async
 */
(async () => {
  try {
    console.log('🚀 Starting TopchiOutpost API Server...');
    
    // Step 1: Establish database connection
    console.log('📊 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected with connection pooling');
    
    // Step 2: Create database indexes for optimal performance
    console.log('📈 Creating database indexes...');
    await createIndexes();
    console.log('✅ Database indexes created');
    
    // Step 3: Initialize cache system
    console.log('🗃️ Initializing cache system...');
    const cacheStats = await cache.getStats();
    console.log(`✅ Cache system initialized (${cacheStats.type})`);
    
    // Step 4: Warm up cache with frequently accessed data
    if (process.env.NODE_ENV === 'production') {
      console.log('🔥 Warming up cache...');
      await warmCache();
      console.log('✅ Cache warmed up');
    }
    
    // Step 5: Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
      console.log('🎉 TopchiOutpost API is ready to serve requests!');
    });

    // Configure server timeouts for production
    server.timeout = 30000; // 30 seconds
    server.keepAliveTimeout = 65000; // 65 seconds
    server.headersTimeout = 66000; // 66 seconds

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      // Stop accepting new connections
      server.close(async () => {
        console.log('🔌 HTTP server closed');
        
        try {
          // Close cache connections
          await cache.close();
          console.log('🗃️ Cache connections closed');
          
          // Close database connections (handled in dbconfig.js)
          console.log('💾 Database connections closed');
          
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during graceful shutdown:', error.message);
          process.exit(1);
        }
      });
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⚠️ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions and unhandled rejections
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    
    // Log error but continue in offline mode for development
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ Running in offline mode. Some features may be unavailable.');
      
      // Start server without database
      const server = app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT} (offline mode)`);
      });
    } else {
      process.exit(1);
    }
  }
})();