/**
 * Upload image to ImageKit
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The uploaded image URL
 */
export const uploadToImageKit = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('folder', '/daily-offers');

    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY + ':')
      },
      body: formData
    });

    const result = await response.json();
    
    if (result.url) {
      return result.url;
    } else {
      throw new Error('Failed to upload to ImageKit');
    }
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw error;
  }
};