const { Router } = require('express');
const {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
  toggleTagStatus
} = require('../AdminControllers/AdminTagController.js');
const upload = require('../middlewares/uploadMiddleware.js');

const router = Router();

router.post('/', upload.single('image'), createTag);
router.get('/', getAllTags);
router.get('/:id', getTagById);
router.put('/:id', upload.single('image'), updateTag);
router.delete('/:id', deleteTag);
router.patch('/:id/toggle-status', toggleTagStatus);

module.exports = router;
