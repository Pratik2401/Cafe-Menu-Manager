const { Router } = require('express');
const {
  getAllSocials,
  getSocialById,
  createSocial,
  updateSocial,
  deleteSocial,
  toggleSocialVisibility,
  upload
} = require('../AdminControllers/AdminSocialController.js');
const router = Router();

// Get all social entries
router.get('/', getAllSocials);

// Get a single social entry by ID
router.get('/:id', getSocialById);

// Create a new social entry
router.post('/', upload.single('customImage'), createSocial);

// Update a social entry by ID
router.put('/:id', upload.single('customImage'), updateSocial);

// Delete a social entry by ID
router.delete('/:id', deleteSocial);

// Optional: Toggle visibility of a social entry by ID
router.patch('/:id/toggle-visibility', toggleSocialVisibility);

module.exports = router;
