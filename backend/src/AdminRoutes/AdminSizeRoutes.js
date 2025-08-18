const express = require('express');
const AdminSizeController = require('../AdminControllers/AdminSizeController.js');
// const adminAuth = require('../middlewares/adminAuth.js');

const router = express.Router();
// Apply admin authentication middleware to all routes
// router.use(adminAuth);

// Size CRUD routes
router.get('/', AdminSizeController.getAllSizes);
router.get('/:id', AdminSizeController.getSizeById);
router.post('/', AdminSizeController.createSize);
router.put('/:id', AdminSizeController.updateSize);
router.delete('/:id', AdminSizeController.deleteSize);

// Size-Item relationship routes
router.post('/item/:itemId/add/:sizeId', AdminSizeController.addSizeToItem);
router.delete('/item/:itemId/remove/:sizeId', AdminSizeController.removeSizeFromItem);

// New routes for CSV export and enable/disable functionality
router.get('/export/csv', AdminSizeController.exportSizesToCSV);
router.put('/:id/toggle-enabled', AdminSizeController.toggleSizeEnabled);

module.exports = router;
