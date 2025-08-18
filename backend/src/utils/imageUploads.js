const fs = require('fs');
const path = require('path');

/**
 * Upload an image to server storage
 * @param {Buffer} file The file buffer to upload
 * @param {string} fileName The name of the file
 * @param {string} folder The folder to upload to (e.g., 'events', 'orders', 'items', 'categories')
 * @returns {Promise<string>} The uploaded image URL
 */
const uploadImage = async (file, fileName, folder) => {
  try {
    // Generate a unique file name to avoid collisions
    const uniqueFileName = `${Date.now()}-${fileName}`;
    
    // Get upload directory from environment variable or use default
    const baseUploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), '..', 'uploads');
    const uploadDir = path.join(baseUploadDir, folder);

    console.log('Upload directory path:', uploadDir);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Created upload directory:', uploadDir);
      } catch (mkdirError) {
        console.error('Failed to create upload directory:', mkdirError);
        throw new Error(`Permission denied: Cannot create directory ${uploadDir}`);
      }
    }
    
    // Write file to server
    const filePath = path.join(uploadDir, uniqueFileName);
    try {
      fs.writeFileSync(filePath, file);
      console.log('Successfully uploaded file:', filePath);
    } catch (writeError) {
      console.error('Failed to write file:', writeError);
      throw new Error(`Permission denied: Cannot write file ${filePath}`);
    }
    
    // Return URL path for serving
    return `/uploads/${folder}/${uniqueFileName}`;
  } catch (error) {
    console.error('Error uploading image to server:', error);
    throw error; // Re-throw the original error with specific message
  }
};

/**
 * Delete an image from server storage
 * @param {string} imageUrl The image URL to delete
 * @returns {Promise<void>}
 */
const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.startsWith('/uploads/')) {
      return; // Not a server-stored image or invalid URL
    }
    
    // Extract the file path from URL
    const relativePath = imageUrl.replace('/uploads/', '');
    
    // Get upload directory from environment variable or use default
    const baseUploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), '..', 'uploads');
    const filePath = path.join(baseUploadDir, relativePath);
    
    console.log('Attempting to delete file at path:', filePath);
    
    // Check if file exists and delete it
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Successfully deleted file');
      return;
    }
    
    console.log('File not found at expected location');
  } catch (error) {
    console.error('Error deleting image from server:', error);
    // Don't throw error, just log it - this prevents the update operation from failing
    // if image deletion fails
  }
};

module.exports = { uploadImage, deleteImage };

