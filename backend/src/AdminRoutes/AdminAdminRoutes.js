const express = require('express');
const { 
  signup, 
  login, 
  forgotPassword, 
  resetPassword,
  getFeatures,
  updateFeatures
} = require('../AdminControllers/AdminAdminController.js');
const router = express.Router();

// Authentication routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Features routes
router.get('/features/:adminId', getFeatures);
router.put('/features/:adminId', updateFeatures);

module.exports = router;
