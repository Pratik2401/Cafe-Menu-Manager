const express = require('express');
const router = express.Router();
const AdminUserInfoController = require('../AdminControllers/AdminUserInfoController');

// Get list of all user info submissions
router.get('/', AdminUserInfoController.getUserInfoList);

// Get user info collection settings
router.get('/settings', AdminUserInfoController.getUserInfoSettings);

// Update user info collection settings
router.put('/settings', AdminUserInfoController.updateUserInfoSettings);

module.exports = router;