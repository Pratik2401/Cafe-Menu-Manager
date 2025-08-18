const express = require('express');
const {
  createDailyOffer,
  getAllDailyOffers,
  getDailyOfferById,
  updateDailyOffer,
  deleteDailyOffer,
  toggleDailyOfferStatus,
  uploadOfferImage
} = require('../AdminControllers/AdminDailyOfferController.js');
const upload = require('../middlewares/uploadMiddleware.js');
const router = express.Router();

// Create a new daily offer
router.post('/', upload.any(), createDailyOffer);

// Get all daily offers
router.get('/', getAllDailyOffers);

// Get daily offer by ID
router.get('/:id', getDailyOfferById);

// Update daily offer
router.put('/:id', upload.any(), updateDailyOffer);

// Delete daily offer
router.delete('/:id', deleteDailyOffer);

// Toggle daily offer active status
router.patch('/:id/toggle-status', toggleDailyOfferStatus);

// Upload offer image
router.post('/:id/offers/:offerId/upload-image', upload.single('image'), uploadOfferImage);

module.exports = router;
