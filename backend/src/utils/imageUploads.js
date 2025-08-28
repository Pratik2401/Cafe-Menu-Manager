const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Upload an image to server storage
 * @param {Buffer} file The file buffer to upload
 * @param {string} fileName The name of the file
 * @param {string} folder The folder to upload to (e.g., 'events', 'orders', 'items', 'categories')
 * @returns {Promise<string>} The uploaded image URL
 */
const uploadImage = async (file, fileName, folder) => {
  try {
    // Generate a unique file name with .webp extension
    const nameWithoutExt = path.parse(fileName).name;
    const uniqueFileName = `${Date.now()}-${nameWithoutExt}.webp`;
    
    // Get upload directory from environment variable or use default
    const baseUploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), '..', 'uploads');
    const uploadDir = path.join(baseUploadDir, folder);

    console.log('Upload directory path:', uploadDir);
    console.log('Process working directory:', process.cwd());
    console.log('Base upload directory:', baseUploadDir);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
        console.log('Created upload directory:', uploadDir);
        
        // Verify directory was created and is writable
        try {
          fs.accessSync(uploadDir, fs.constants.W_OK);
          console.log('Directory is writable');
        } catch (accessError) {
          console.error('Directory created but not writable:', accessError);
          throw new Error(`Directory created but not writable: ${uploadDir}`);
        }
      } catch (mkdirError) {
        console.error('Failed to create upload directory:', mkdirError);
        console.error('Error details:', {
          code: mkdirError.code,
          errno: mkdirError.errno,
          path: mkdirError.path,
          syscall: mkdirError.syscall
        });
        throw new Error(`Permission denied: Cannot create directory ${uploadDir}. Error: ${mkdirError.message}`);
      }
    } else {
      // Directory exists, check if it's writable
      try {
        fs.accessSync(uploadDir, fs.constants.W_OK);
        console.log('Existing directory is writable');
      } catch (accessError) {
        console.error('Directory exists but not writable:', accessError);
        throw new Error(`Directory exists but not writable: ${uploadDir}`);
      }
    }
    
    // Convert image to WebP format and write to server
    const filePath = path.join(uploadDir, uniqueFileName);
    try {
      await sharp(file)
        .webp({ 
          quality: 80,
          lossless: false,
          nearLossless: false,
          alphaQuality: 100,
          effort: 4
        })
        .toFile(filePath);
      console.log('Successfully uploaded and converted file to WebP:', filePath);
    } catch (writeError) {
      console.error('Failed to convert and write file:', writeError);
      throw new Error(`Failed to process image: ${writeError.message}`);
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

