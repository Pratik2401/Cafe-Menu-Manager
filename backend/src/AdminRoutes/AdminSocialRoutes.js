const { Router } = require('express');
const {
  getAllSocials,
  getSocialById,
  createSocial,
  updateSocial,
  deleteSocial,
  toggleSocialVisibility,
  updateSocialSerials,
  upload
} = require('../AdminControllers/AdminSocialController.js');
const { adminAuth } = require('../middlewares/adminAuth.js');
const router = Router();

// Get all social entries
router.get('/', getAllSocials);

// Update social media serial order (must be before /:id routes)
router.put('/update-serials', updateSocialSerials);

// Get a single social entry by ID
router.get('/:id', getSocialById);

// Create a new social entry
router.post('/', upload.single('icon'), createSocial);

// Update a social entry by ID
router.put('/:id', upload.single('icon'), updateSocial);

// Delete a social entry by ID
router.delete('/:id', deleteSocial);

// Toggle visibility of a social entry by ID
router.patch('/:id/toggle-visibility', toggleSocialVisibility);

module.exports = router;
