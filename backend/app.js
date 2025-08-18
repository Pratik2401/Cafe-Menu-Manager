/**
 * @fileoverview Main Express application setup for TopchiOutpost Cafe Management System
 * 
 * This file configures the Express server with all necessary middleware, routes,
 * and error handling. It serves as the central hub for the entire backend application.
 * 
 * @author TopchiOutpost Development Team
 * @version 1.0.0
 * @since 2025-01-01
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

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

// __dirname is available in CommonJS by default
const app = express();

// ========================================================================================
// CORS CONFIGURATION
// ========================================================================================
// Configure Cross-Origin Resource Sharing for frontend applications
// Production and development URLs are whitelisted for security
app.use(cors({
  origin: ['https://startup-repo-1.vercel.app', 'http://localhost:5173']
}));

// ========================================================================================
// MIDDLEWARE CONFIGURATION
// ========================================================================================

/**
 * JSON parser middleware with increased size limit for large payloads
 * @description Handles JSON requests up to 50MB (for base64 image uploads)
 */
app.use(express.json({ limit: '50mb' }));

/**
 * URL-encoded parser middleware for form submissions
 * @description Handles form data with extended syntax support
 */
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
 * Serve static files from uploads directory
 * @description Provides public access to uploaded images and documents
 * @example Access uploaded file: http://localhost:3000/uploads/categories/image.jpg
 */
app.use('/uploads', express.static(uploadsDir));
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

app.use('/api/customer/items', customerItemRoutes);
app.use('/api/customer/subcategories', customerSubCategoryRoutes);
app.use('/api/customer/category', customerCategoryRoutes);
app.use('/api/customer/food-categories', customerFoodCategoryRoutes);
app.use('/api/customer/daily-offers', customerDailyOfferRoutes);
app.use('/api/customer/socials', customerSocialRoutes);
app.use('/api/customer/cafe', customerCafeRoutes);
app.use('/api/customer/events', customerEventRoutes);
app.use('/api/customer/tags', customerTagRoutes);
app.use('/api/customer/sizes', customerSizeRoutes);
app.use('/api/customer/feedback', customerFeedbackRoutes);
app.use('/api/customer/messages', customerMessageRoutes);
app.use('/api/customer/allergies', customerAllergyRoutes);
app.use('/api/customer/user-info', customerUserInfoRoutes);
app.use('/api/customer/image-uploads', customerImageUploadRoutes);

app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/items', adminItemRoutes);
app.use('/api/admin/category', adminCategoryRoutes);
app.use('/api/admin/food-categories', adminFoodCategoryRoutes);
app.use('/api/admin/subcategories', adminSubCategoryRoutes);
app.use('/api/admin/daily-offers', adminDailyOfferRoutes);
app.use('/api/admin/socials', adminSocialRoutes);
app.use('/api/admin/events', adminEventRoutes);
app.use('/api/admin/event-items', adminEventItemRoutes);
app.use('/api/admin/tags', adminTagRoutes);
app.use('/api/admin/sizes', adminSizeRoutes);
app.use('/api/admin/feedback', adminFeedbackRoutes);
app.use('/api/admin/messages', adminMessageRoutes);
app.use('/api/admin/allergies', adminAllergyRoutes);
app.use('/api/admin/user-info', require('./src/AdminRoutes/AdminUserInfoRoutes.js'));
app.use('/api/admin/image-uploads', adminImageUploadRoutes);
app.use('/api/admin', adminCafeRoutes);

// Add variation routes
app.use('/api/admin/variations', require('./src/AdminRoutes/AdminVariationRoutes.js'));
app.use('/api/customer/variations', require('./src/CustomerRoutes/CustomerVariationRoutes.js'));

app.use('/theme', customerThemeRoutes);

app.get('/theme/theme.css', (req, res) => {
  req.url = '/theme.css';
  adminThemeRoutes(req, res, () => {});
});

app.use(errorHandler);

module.exports = app;