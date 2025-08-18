const express = require('express');
const { getThemeCSS, getThemeSettings } = require('../CustomerControllers/CustomerThemeController');

const router = express.Router();

// Route to serve dynamic CSS based on cafe settings
router.get('/', getThemeCSS);
router.get('/theme.css', getThemeCSS);

// Route to get theme settings including logo URL and background color
router.get('/settings', getThemeSettings);

module.exports = router;