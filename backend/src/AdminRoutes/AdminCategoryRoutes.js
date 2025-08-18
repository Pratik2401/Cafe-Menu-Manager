const { Router } = require('express');
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  updateCategorySerialId,
  toggleCategoryVisibility
} = require('../AdminControllers/AdminCategoryController.js');
const upload = require('../middlewares/uploadMiddleware.js');
const router = Router();


router.post('/',upload.single('image'), createCategory);
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.put('/:id',upload.single('image'), updateCategory);
router.delete('/:id', deleteCategory);
router.patch('/:id/serial', updateCategorySerialId);
router.patch('/:id/toggle-visibility', toggleCategoryVisibility);
module.exports = router;
