/**
 * Background Image Loader Utility
 * @description Preloads background images with proper CORS handling
 * @author TopchiOutpost Development Team
 */

/**
 * Preload an image with proper CORS handling
 * @param {string} imageUrl - The URL of the image to preload
 * @returns {Promise<string>} Promise that resolves with the image URL when loaded
 */
export function preloadBackgroundImage(imageUrl) {
  return new Promise((resolve, reject) => {
    if (!imageUrl) {
      resolve('');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS
    
    img.onload = () => {
      console.log('✅ Background image preloaded successfully:', imageUrl);
      resolve(imageUrl);
    };
    
    img.onerror = (error) => {
      console.error('❌ Failed to preload background image:', imageUrl, error);
      // Don't reject, just resolve with empty string to gracefully handle failures
      resolve('');
    };
    
    img.src = imageUrl;
  });
}

/**
 * Convert image to data URL (base64) to avoid CORS issues
 * @param {string} imageUrl - The URL of the image to convert
 * @returns {Promise<string>} Promise that resolves with data URL
 */
export function imageToDataUrl(imageUrl) {
  return new Promise((resolve, reject) => {
    if (!imageUrl) {
      resolve('');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        ctx.drawImage(img, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        console.log('✅ Background image converted to data URL');
        resolve(dataUrl);
      } catch (error) {
        console.error('❌ Failed to convert image to data URL:', error);
        resolve('');
      }
    };
    
    img.onerror = (error) => {
      console.error('❌ Failed to load image for data URL conversion:', error);
      resolve('');
    };
    
    img.src = imageUrl;
  });
}

/**
 * Load background image with fallback strategies
 * @param {string} imageUrl - The URL of the image
 * @param {Object} options - Loading options
 * @param {boolean} options.useDataUrl - Whether to convert to data URL
 * @param {boolean} options.preload - Whether to preload the image
 * @returns {Promise<string>} Promise that resolves with the usable image URL
 */
export async function loadBackgroundImage(imageUrl, options = {}) {
  const { useDataUrl = false, preload = true } = options;
  
  if (!imageUrl) return '';
  
  try {
    if (useDataUrl) {
      // Convert to data URL to avoid CORS issues entirely
      return await imageToDataUrl(imageUrl);
    } else if (preload) {
      // Preload image to check if it loads properly
      return await preloadBackgroundImage(imageUrl);
    } else {
      // Return URL as-is
      return imageUrl;
    }
  } catch (error) {
    console.error('❌ Background image loading failed:', error);
    return '';
  }
}
