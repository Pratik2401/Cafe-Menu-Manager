const express = require('express');
const {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  getSubCategoriesByCategoryId,
  toggleSubCategoryVisibility,
  updateSubCategorySerialId
} = require('../AdminControllers/AdminSubCategoryController.js');
const router = express.Router();

router.post('/', createSubCategory);
router.get('/', getAllSubCategories);
router.get('/:id', getSubCategoryById);
router.put('/:id', updateSubCategory);
router.delete('/:id', deleteSubCategory);
router.get('/category/:categoryId', getSubCategoriesByCategoryId);
router.patch('/:id/toggle-visibility', toggleSubCategoryVisibility);
router.patch('/:id/serial', updateSubCategorySerialId);

module.exports = router;
