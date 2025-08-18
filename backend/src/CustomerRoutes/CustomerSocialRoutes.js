const express = require('express');
const {getAllSocials} = require('../CustomerControllers/CustomerSocialController');

const router = express.Router();

// Get all social entries
router.get('/', getAllSocials);

module.exports = router;
