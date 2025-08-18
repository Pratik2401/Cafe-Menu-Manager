const multer = require('multer');

// Configure storage to use memory storage for CSV processing
const storage = multer.memoryStorage();

// File filter to only allow CSV files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Not a CSV file! Please upload only CSV files.'));
  }
};

// Create multer upload instance for CSV files
const csvUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit for CSV files
  }
});

module.exports = csvUpload;