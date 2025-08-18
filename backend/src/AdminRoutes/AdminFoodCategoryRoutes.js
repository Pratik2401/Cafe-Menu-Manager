const { Router } = require('express');
const {
  createFoodCategory,
  getAllFoodCategories,
  getFoodCategoryById,
  updateFoodCategory,
  deleteFoodCategory,
  toggleFoodCategoryStatus
} = require('../AdminControllers/AdminFoodCategoryController.js');
const upload = require('../middlewares/uploadMiddleware.js');

const router = Router();

router.post('/', upload.single('icon'), createFoodCategory);
router.get('/', getAllFoodCategories);
router.get('/:id', getFoodCategoryById);
router.put('/:id', upload.single('icon'), updateFoodCategory);
router.delete('/:id', deleteFoodCategory);
router.patch('/:id/toggle-status', toggleFoodCategoryStatus);

module.exports = router;
