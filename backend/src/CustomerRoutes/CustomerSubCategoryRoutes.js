const express = require('express');
const {
  getAllSubCategories,
  getSubCategoryById,
} = require('../CustomerControllers/CustomerSubCategoryController');

const router = express.Router();

router.get('/', getAllSubCategories);
router.get('/:id', getSubCategoryById);

module.exports = router;
