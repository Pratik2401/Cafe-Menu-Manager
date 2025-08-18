const express = require('express');
const { 
  getCafe, 
  updateCafe, 
  updateTaxSettings, 
  updateLocationSettings, 
  toggleOrderingStatus,
  getTables,
  createTable,
  updateTable,
  deleteTable,
  toggleTableStatus,
  uploadCafeImage,
  uploadBackgroundImage,
  updateMenuCustomization,
  uploadMenuLogo,
  uploadMenuBackgroundImage
} = require('../AdminControllers/AdminCafeController.js');
const upload = require('../middlewares/uploadMiddleware.js');
// const adminAuth = require('../middlewares/adminAuth.js');

const router = express.Router();

// Cafe settings routes
router.get('/settings', getCafe);
router.put('/settings', updateCafe);
router.put('/settings/tax', updateTaxSettings);
router.put('/settings/location', updateLocationSettings);
router.patch('/settings/ordering', toggleOrderingStatus);
router.post('/settings/upload-image', upload.single('image'), uploadCafeImage);
router.post('/settings/upload-background', upload.single('image'), uploadBackgroundImage);
router.put('/settings/menu-customization', updateMenuCustomization);
router.post('/settings/upload-menu-logo', upload.single('logo'), uploadMenuLogo);
router.post('/settings/upload-menu-background', upload.single('backgroundImage'), uploadMenuBackgroundImage);

// Table management routes
router.get('/tables', getTables);
router.post('/tables', createTable);
router.put('/tables/:id', updateTable);
router.delete('/tables/:id', deleteTable);
router.patch('/tables/:id/status', toggleTableStatus);

module.exports = router;
