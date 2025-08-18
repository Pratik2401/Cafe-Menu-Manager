const { Router } = require('express');
const {
  createAllergy,
  getAllAllergies,
  getAllergyById,
  updateAllergy,
  deleteAllergy,
  toggleAllergyStatus
} = require('../AdminControllers/AdminAllergyController.js');
const upload = require('../middlewares/uploadMiddleware.js');

const router = Router();

router.post('/', upload.single('image'), createAllergy);
router.get('/', getAllAllergies);
router.get('/:id', getAllergyById);
router.put('/:id', upload.single('image'), updateAllergy);
router.delete('/:id', deleteAllergy);
router.patch('/:id/toggle-status', toggleAllergyStatus);

module.exports = router;