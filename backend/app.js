/**
 * @fileoverview Optimized Express Application for TopchiOutpost Cafe Management System
 * 
 * This file configures the Express server with production-ready optimizations including
 * compression, rate limiting, security headers, caching, and error handling.
 * 
 * @author TopchiOutpost Development Team
 * @version 2.0.0
 * @since 2025-01-01
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const compression = require('compression');

// Security and performance middleware
const { 
  securityHeaders, 
  securityLogger, 
  middlewareStacks,
  requestSizeLimits 
} = require('./src/middlewares/security.js');

// Caching middleware
const { 
  cacheMonitoring,
  cacheCategories,
  cacheMenuItems,
  cacheSubCategories,
  cacheFoodCategories,
  cacheDailyOffers,
  cacheEvents,
  cacheThemeSettings,
  cacheCafeInfo,
  cacheSocialLinks 
} = require('./src/middlewares/caching.js');

// ========================================================================================
// CUSTOMER ROUTE IMPORTS
// ========================================================================================
// Customer-facing routes provide public access to menu items, events, and other
// customer-visible content without requiring authentication

const customerItemRoutes = require('./src/CustomerRoutes/CustomerItemRoutes.js');
const customerCategoryRoutes = require('./src/CustomerRoutes/CustomerCategoryRoutes.js');
const customerFoodCategoryRoutes = require('./src/CustomerRoutes/CustomerFoodCategoryRoutes.js');
const customerSubCategoryRoutes = require('./src/CustomerRoutes/CustomerSubCategoryRoutes.js');
const customerDailyOfferRoutes = require('./src/CustomerRoutes/CustomerDailyOfferRoutes.js');
const customerSocialRoutes = require('./src/CustomerRoutes/CustomerSocialRoutes.js');
const customerCafeRoutes = require('./src/CustomerRoutes/CustomerCafeRoutes.js');
const customerEventRoutes = require('./src/CustomerRoutes/CustomerEventRoutes.js');
const customerTagRoutes = require('./src/CustomerRoutes/CustomerTagRoutes.js');
const customerSizeRoutes = require('./src/CustomerRoutes/CustomerSizeRoutes.js');
const customerFeedbackRoutes = require('./src/CustomerRoutes/CustomerFeedbackRoutes.js');
const customerMessageRoutes = require('./src/CustomerRoutes/CustomerMessageRoutes.js');
const customerAllergyRoutes = require('./src/CustomerRoutes/CustomerAllergyRoutes.js');
const customerUserInfoRoutes = require('./src/CustomerRoutes/CustomerUserInfoRoutes.js');
const customerImageUploadRoutes = require('./src/CustomerRoutes/CustomerImageUploadRoutes.js');

// ========================================================================================
// ADMIN ROUTE IMPORTS
// ========================================================================================
// Admin routes require JWT authentication and provide full CRUD operations
// for managing all aspects of the cafe system

const adminAuthRoutes = require('./src/AdminRoutes/AdminAdminRoutes.js');
const adminItemRoutes = require('./src/AdminRoutes/AdminItemRoutes.js');
const adminCategoryRoutes = require('./src/AdminRoutes/AdminCategoryRoutes.js');
const adminFoodCategoryRoutes = require('./src/AdminRoutes/AdminFoodCategoryRoutes.js');
const adminSubCategoryRoutes = require('./src/AdminRoutes/AdminSubCategoryRoutes.js');
const adminDailyOfferRoutes = require('./src/AdminRoutes/AdminDailyOfferRoutes.js');
const adminSocialRoutes = require('./src/AdminRoutes/AdminSocialRoutes.js');
const adminCafeRoutes = require('./src/AdminRoutes/AdminCafeRoutes.js');
const adminEventRoutes = require('./src/AdminRoutes/AdminEventRoutes.js');
const adminEventItemRoutes = require('./src/AdminRoutes/AdminEventItemRoutes.js');
const adminTagRoutes = require('./src/AdminRoutes/AdminTagRoutes.js');
const adminSizeRoutes = require('./src/AdminRoutes/AdminSizeRoutes.js');
const adminFeedbackRoutes = require('./src/AdminRoutes/AdminFeedbackRoutes.js');
const adminMessageRoutes = require('./src/AdminRoutes/AdminMessageRoutes.js');
const adminAllergyRoutes = require('./src/AdminRoutes/AdminAllergyRoutes.js');
const adminImageUploadRoutes = require('./src/AdminRoutes/AdminImageUploadRoutes.js');

// ========================================================================================
// MIDDLEWARE AND UTILITY IMPORTS
// ========================================================================================

const { errorHandler } = require('./src/middlewares/errorHandler.js');

// Theme-related routes for dynamic CSS generation and customization
const adminThemeRoutes = require('./src/AdminRoutes/AdminThemeRoutes.js');
const customerThemeRoutes = require('./src/CustomerRoutes/CustomerThemeRoutes.js');

// ========================================================================================
// EXPRESS APPLICATION SETUP
// ========================================================================================

const app = express();

// ========================================================================================
// PRODUCTION OPTIMIZATIONS
// ========================================================================================

/**
 * Compression middleware for response optimization
 * @description Compresses all responses to reduce bandwidth usage
 */
app.use(compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress responses if this request has a cache-control header set to no-transform
    if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

/**
 * Security headers middleware
 * @description Adds comprehensive security headers for production
 */
app.use(securityHeaders);

/**
 * Security logging middleware
 * @description Logs security events and suspicious requests
 */
app.use(securityLogger);

/**
 * Cache monitoring middleware
 * @description Adds cache status headers for monitoring
 */
app.use(cacheMonitoring);

// ========================================================================================
// CORS CONFIGURATION
// ========================================================================================
// Configure Cross-Origin Resource Sharing for frontend applications
// Production and development URLs are whitelisted for security
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : [
    'https://startup-repo-1.vercel.app', 
    'http://localhost:5173',
    'http://localhost:5174', // Additional dev port
    'http://localhost:3000', // Same origin
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ];

app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: process.env.CORS_CREDENTIALS === 'true',
  maxAge: 86400 // 24 hours preflight cache
}));

// ========================================================================================
// REQUEST SIZE & PARSING MIDDLEWARE
// ========================================================================================

/**
 * JSON parser middleware with optimized size limits
 * @description Handles JSON requests with production-appropriate limits
 */
app.use(express.json(requestSizeLimits.json));

/**
 * URL-encoded parser middleware for form submissions
 * @description Handles form data with extended syntax support
 */
app.use(express.urlencoded(requestSizeLimits.urlencoded));

// ========================================================================================
// STATIC FILE SERVING & UPLOAD DIRECTORY SETUP
// ========================================================================================

/**
 * Get uploads directory from environment variable or use default
 * @description Uses UPLOAD_DIR environment variable or defaults to ../uploads
 */
const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');

/**
 * Ensure uploads directory structure exists
 * @description Creates necessary directories for file uploads if they don't exist
 */
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Create subdirectories for different types of uploads
 * @description Organizes uploaded images by category for better file management
 */
const subdirectories = ['social-images', 'items', 'categories', 'events', 'offers', 'food-categories'];
subdirectories.forEach(subdir => {
  const subdirPath = path.join(uploadsDir, subdir);
  if (!fs.existsSync(subdirPath)) {
    fs.mkdirSync(subdirPath, { recursive: true });
  }
});

/**
 * Serve static files from uploads directory with CORS headers
 * @description Provides public access to uploaded images and documents with proper CORS
 * @example Access uploaded file: http://localhost:3000/uploads/categories/image.jpg
 */
app.use('/uploads', (req, res, next) => {
  console.log(`📸 Static file request: ${req.method} ${req.url} from origin: ${req.headers.origin || 'no-origin'}`);
  console.log(`📸 Request headers:`, {
    'user-agent': req.headers['user-agent'],
    'referer': req.headers['referer'],
    'sec-fetch-site': req.headers['sec-fetch-site'],
    'sec-fetch-mode': req.headers['sec-fetch-mode'],
    'sec-fetch-dest': req.headers['sec-fetch-dest']
  });
  
  // Use the same CORS origins as the main app
  const origin = req.headers.origin;
  
  // Set appropriate CORS headers
  if (origin && corsOrigins.includes(origin)) {
    // For requests with allowed origins, set specific origin and allow credentials
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else {
    // For requests without origin (direct browser navigation), allow all origins but no credentials
    res.header('Access-Control-Allow-Origin', '*');
    // Don't set credentials header for wildcard origin
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Add Cross-Origin Resource Policy to allow cross-origin embedding
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Add Cross-Origin Embedder Policy for better compatibility
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // Add Timing-Allow-Origin for performance monitoring
  res.header('Timing-Allow-Origin', '*');
  
  // Add Cross-Origin-Opener-Policy for security
  res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  
  // Add cache headers for better performance
  res.header('Cache-Control', 'public, max-age=86400'); // 24 hours cache
  
  // Add content-type headers for images
  if (req.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    const ext = path.extname(req.url).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml'
    };
    res.header('Content-Type', mimeTypes[ext] || 'image/jpeg');
    console.log(`📸 Setting content-type for ${req.url}: ${mimeTypes[ext] || 'image/jpeg'}`);
  } else if (req.url.includes('/social-images/') || req.url.includes('/items/') || req.url.includes('/categories/')) {
    // For uploaded images without extensions, assume JPEG
    res.header('Content-Type', 'image/jpeg');
    console.log(`📸 Setting default content-type for ${req.url}: image/jpeg`);
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`📸 Handling OPTIONS preflight for: ${req.url}`);
    return res.sendStatus(200);
  }
  
  next();
}, express.static(uploadsDir));
console.log('Serving static files from:', uploadsDir);

// ========================================================================================
// HEALTH CHECK ENDPOINT
// ========================================================================================

/**
 * Health check endpoint for monitoring service status
 * @route GET /
 * @description Provides basic API status information and uptime verification
 * @access Public
 * @returns {Object} JSON response with status information
 */
app.get('/', (req, res) => {
  console.log('Health check endpoint called');
  res.json({ 
    status: 'OK', 
    message: 'TopchiOutpost API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ========================================================================================
// API ROUTES WITH CACHING AND RATE LIMITING
// ========================================================================================

// Customer routes with caching and rate limiting
app.use('/api/customer/items', middlewareStacks.customer, customerItemRoutes); // Removed caching for real-time show/hide
app.use('/api/customer/subcategories', middlewareStacks.customer, cacheSubCategories, customerSubCategoryRoutes);
app.use('/api/customer/category', middlewareStacks.customer, cacheCategories, customerCategoryRoutes);
app.use('/api/customer/food-categories', middlewareStacks.customer, cacheFoodCategories, customerFoodCategoryRoutes);
app.use('/api/customer/daily-offers', middlewareStacks.customer, cacheDailyOffers, customerDailyOfferRoutes);
app.use('/api/customer/socials', middlewareStacks.customer, cacheSocialLinks, customerSocialRoutes);
app.use('/api/customer/cafe', middlewareStacks.customer, cacheCafeInfo, customerCafeRoutes);
app.use('/api/customer/events', middlewareStacks.customer, cacheEvents, customerEventRoutes);
app.use('/api/customer/tags', middlewareStacks.customer, customerTagRoutes);
app.use('/api/customer/sizes', middlewareStacks.customer, customerSizeRoutes);
app.use('/api/customer/feedback', middlewareStacks.customer, customerFeedbackRoutes);
app.use('/api/customer/messages', middlewareStacks.customer, customerMessageRoutes);
app.use('/api/customer/allergies', middlewareStacks.customer, customerAllergyRoutes);
app.use('/api/customer/user-info', middlewareStacks.customer, customerUserInfoRoutes);
app.use('/api/customer/image-uploads', middlewareStacks.upload, customerImageUploadRoutes);
app.use('/api/customer/variations', middlewareStacks.customer, require('./src/CustomerRoutes/CustomerVariationRoutes.js'));

// Admin routes with strict rate limiting
app.use('/api/admin/auth', middlewareStacks.auth, adminAuthRoutes);
app.use('/api/admin/items', middlewareStacks.admin, adminItemRoutes);
app.use('/api/admin/category', middlewareStacks.admin, adminCategoryRoutes);
app.use('/api/admin/food-categories', middlewareStacks.admin, adminFoodCategoryRoutes);
app.use('/api/admin/subcategories', middlewareStacks.admin, adminSubCategoryRoutes);
app.use('/api/admin/daily-offers', middlewareStacks.admin, adminDailyOfferRoutes);
app.use('/api/admin/socials', middlewareStacks.admin, adminSocialRoutes);
app.use('/api/admin/events', middlewareStacks.admin, adminEventRoutes);
app.use('/api/admin/event-items', middlewareStacks.admin, adminEventItemRoutes);
app.use('/api/admin/tags', middlewareStacks.admin, adminTagRoutes);
app.use('/api/admin/sizes', middlewareStacks.admin, adminSizeRoutes);
app.use('/api/admin/feedback', middlewareStacks.admin, adminFeedbackRoutes);
app.use('/api/admin/messages', middlewareStacks.admin, adminMessageRoutes);
app.use('/api/admin/allergies', middlewareStacks.admin, adminAllergyRoutes);
app.use('/api/admin/user-info', middlewareStacks.admin, require('./src/AdminRoutes/AdminUserInfoRoutes.js'));
app.use('/api/admin/image-uploads', middlewareStacks.upload, adminImageUploadRoutes);
app.use('/api/admin', middlewareStacks.admin, adminCafeRoutes);
app.use('/api/admin/variations', middlewareStacks.admin, require('./src/AdminRoutes/AdminVariationRoutes.js'));

// Theme routes with long-term caching
app.use('/theme', middlewareStacks.customer, cacheThemeSettings, customerThemeRoutes);

app.get('/theme/theme.css', middlewareStacks.customer, cacheThemeSettings, (req, res) => {
  req.url = '/theme.css';
  adminThemeRoutes(req, res, () => {});
});

app.use(errorHandler);

module.exports = app;