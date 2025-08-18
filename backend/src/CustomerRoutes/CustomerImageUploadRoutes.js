const { Router } = require('express');
const { getAllImageUploads } = require('../CustomerControllers/CustomerImageUploadController.js');

const router = Router();

router.get('/', getAllImageUploads);

module.exports = router;