const { Router } = require('express');
const {
  getAllAllergies,
  getAllergyById
} = require('../CustomerControllers/CustomerAllergyController.js');

const router = Router();

router.get('/', getAllAllergies);
router.get('/:id', getAllergyById);

module.exports = router;