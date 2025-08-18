const express = require('express');
const { 
  getMessages,
  updateMessages
} = require('../AdminControllers/AdminMessageController.js');

const router = express.Router();

// Get all custom messages
router.get('/', getMessages);

// Update custom messages
router.put('/', updateMessages);

module.exports = router;