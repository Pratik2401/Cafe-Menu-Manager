const multer = require('multer');
const path = require('path');
const fs = require('fs');

// __dirname is available in CommonJS by default

// Configure storage to use memory storage for ImageKit upload
const storage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'));
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Ensure /tmp exists
const tempDir = path.join(__dirname, '../tmp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

module.exports = upload;