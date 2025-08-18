const express = require('express');
const router = express.Router();
const CustomerUserInfoController = require('../CustomerControllers/CustomerUserInfoController');

// Create user info
router.post('/', CustomerUserInfoController.createUserInfo);

// Get user info by email
router.get('/:email', CustomerUserInfoController.getUserInfoByEmail);

module.exports = router;