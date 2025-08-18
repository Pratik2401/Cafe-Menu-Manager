const { Router } = require('express');
const {
  getAllTags,
  getTagById
} = require('../CustomerControllers/CustomerTagController');

const router = Router();

router.get('/', getAllTags);
router.get('/:id', getTagById);

module.exports = router;