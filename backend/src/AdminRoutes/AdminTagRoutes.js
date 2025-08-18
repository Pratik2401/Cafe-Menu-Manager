const { Router } = require('express');
const {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
  toggleTagStatus
} = require('../AdminControllers/AdminTagController.js');

const router = Router();

router.post('/', createTag);
router.get('/', getAllTags);
router.get('/:id', getTagById);
router.put('/:id', updateTag);
router.delete('/:id', deleteTag);
router.patch('/:id/toggle-status', toggleTagStatus);

module.exports = router;
