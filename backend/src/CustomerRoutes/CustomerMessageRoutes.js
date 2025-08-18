const express = require('express');
const { getMessages } = require('../AdminControllers/AdminMessageController.js');

const router = express.Router();

// Get all custom messages for customer use
router.get('/', getMessages);

module.exports = router;