const { Router } = require('express');
const {
  createImageUpload,
  getAllImageUploads,
  deleteImageUpload,
  toggleImageUploadVisibility
} = require('../AdminControllers/AdminImageUploadController.js');
const upload = require('../middlewares/uploadMiddleware.js');

const router = Router();

router.post('/', upload.single('image'), createImageUpload);
router.get('/', getAllImageUploads);
router.delete('/:id', deleteImageUpload);
router.patch('/:id/toggle-visibility', toggleImageUploadVisibility);

module.exports = router;