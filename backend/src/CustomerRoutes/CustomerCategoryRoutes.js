const { Router } = require('express');
const {
  getAllCategories,
  getCategoryById,
} = require('../CustomerControllers/CustomercategoryController');
const upload = require('../middlewares/uploadMiddleware');
const router = Router();

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
module.exports = router;
