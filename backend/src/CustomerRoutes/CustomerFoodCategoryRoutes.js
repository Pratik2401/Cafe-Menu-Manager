const { Router } = require('express');
const {
  getAllFoodCategories,
  getFoodCategoryById
} = require('../CustomerControllers/CustomerFoodCategoryController');

const router = Router();

router.get('/', getAllFoodCategories);
router.get('/:id', getFoodCategoryById);

module.exports = router;