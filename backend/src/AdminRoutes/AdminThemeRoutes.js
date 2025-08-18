const express = require('express');
const { getThemeCSS, testThemeEndpoint, getThemeSettings } = require('../AdminControllers/AdminThemeController.js');
const router = express.Router();

// Test endpoint to verify the theme routes are working
router.get('/test', testThemeEndpoint);

// Route to serve dynamic CSS based on cafe settings
router.get('/theme.css', getThemeCSS);
// Additional route to handle the frontend request path
router.get('/', getThemeCSS);

// Route to get theme settings including logo URL and background color
router.get('/settings', getThemeSettings);

module.exports = router;
