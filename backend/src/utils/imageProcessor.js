/**
 * @fileoverview Image Processing Service for TopchiOutpost Cafe Management System
 * 
 * This module provides optimized image processing using Sharp for WebP conversion,
 * resizing, and optimization to improve page load times and reduce bandwidth usage.
 * 
 * @author TopchiOutpost Development Team
 * @version 1.0.0
 * @since 2025-01-01
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * Image processing service with Sharp
 * @description Handles image optimization, format conversion, and responsive sizing
 */
class ImageProcessor {
  constructor() {
    this.uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', '..', 'uploads');
    
    // Image quality settings
    this.quality = {
      webp: 85,
      jpeg: 90,
      png: 95,
    };
    
    // Supported image formats for conversion
    this.supportedFormats = ['jpeg', 'jpg', 'png', 'gif', 'tiff', 'bmp'];
    
    // Responsive image sizes
    this.responsiveSizes = {
      thumbnail: { width: 150, height: 150 },
      small: { width: 300, height: 300 },
      medium: { width: 600, height: 600 },
      large: { width: 1200, height: 1200 },
    };
  }

  /**
   * Process uploaded image with optimization
   * @param {Buffer} buffer - Image buffer
   * @param {string} originalName - Original filename
   * @param {string} category - Upload category (items, categories, etc.)
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Processing result with file paths
   */
  async processImage(buffer, originalName, category, options = {}) {
    try {
      const {
        generateResponsive = true,
        convertToWebP = true,
        resize = null,
        preserveOriginal = false,
      } = options;

      // Generate unique filename
      const timestamp = Date.now();
      const baseName = path.parse(originalName).name.replace(/[^a-zA-Z0-9-_]/g, '-');
      const baseFilename = `${timestamp}-${baseName}`;
      
      // Ensure category directory exists
      const categoryDir = path.join(this.uploadsDir, category);
      await this.ensureDirectoryExists(categoryDir);

      const result = {
        original: null,
        webp: null,
        responsive: {},
        metadata: null,
      };

      // Get image metadata
      const image = sharp(buffer);
      const metadata = await image.metadata();
      result.metadata = {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: buffer.length,
      };

      // Process original image (optimized)
      if (preserveOriginal || !convertToWebP) {
        const originalPath = path.join(categoryDir, `${baseFilename}.${metadata.format}`);
        await this.optimizeImage(buffer, originalPath, metadata.format);
        result.original = this.getRelativePath(originalPath);
      }

      // Convert to WebP for better compression
      if (convertToWebP) {
        const webpPath = path.join(categoryDir, `${baseFilename}.webp`);
        await this.convertToWebP(buffer, webpPath, resize);
        result.webp = this.getRelativePath(webpPath);
      }

      // Generate responsive sizes
      if (generateResponsive) {
        result.responsive = await this.generateResponsiveSizes(
          buffer, 
          categoryDir, 
          baseFilename, 
          convertToWebP
        );
      }

      console.log(`📸 Image processed successfully: ${originalName} -> ${baseFilename}`);
      return result;

    } catch (error) {
      console.error('❌ Image processing error:', error.message);
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  /**
   * Optimize image while preserving format
   * @param {Buffer} buffer - Image buffer
   * @param {string} outputPath - Output file path
   * @param {string} format - Original format
   * @returns {Promise<void>}
   */
  async optimizeImage(buffer, outputPath, format) {
    let pipeline = sharp(buffer);

    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        pipeline = pipeline.jpeg({ 
          quality: this.quality.jpeg,
          progressive: true,
          mozjpeg: true 
        });
        break;
      case 'png':
        pipeline = pipeline.png({ 
          quality: this.quality.png,
          compressionLevel: 9,
          progressive: true 
        });
        break;
      case 'webp':
        pipeline = pipeline.webp({ 
          quality: this.quality.webp,
          effort: 6 
        });
        break;
      default:
        // Keep original format for unsupported formats
        break;
    }

    await pipeline.toFile(outputPath);
  }

  /**
   * Convert image to WebP format
   * @param {Buffer} buffer - Image buffer
   * @param {string} outputPath - Output file path
   * @param {Object} resize - Resize options
   * @returns {Promise<void>}
   */
  async convertToWebP(buffer, outputPath, resize = null) {
    let pipeline = sharp(buffer);

    if (resize) {
      pipeline = pipeline.resize(resize.width, resize.height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    await pipeline
      .webp({
        quality: this.quality.webp,
        effort: 6,
        lossless: false,
      })
      .toFile(outputPath);
  }

  /**
   * Generate responsive image sizes
   * @param {Buffer} buffer - Image buffer
   * @param {string} categoryDir - Category directory path
   * @param {string} baseFilename - Base filename
   * @param {boolean} webpOnly - Generate only WebP versions
   * @returns {Promise<Object>} Responsive image paths
   */
  async generateResponsiveSizes(buffer, categoryDir, baseFilename, webpOnly = true) {
    const responsive = {};
    
    for (const [sizeName, dimensions] of Object.entries(this.responsiveSizes)) {
      try {
        const filename = `${baseFilename}-${sizeName}.webp`;
        const outputPath = path.join(categoryDir, filename);
        
        await sharp(buffer)
          .resize(dimensions.width, dimensions.height, {
            fit: 'inside',
            withoutEnlargement: true,
            background: { r: 255, g: 255, b: 255, alpha: 0 },
          })
          .webp({
            quality: this.quality.webp,
            effort: 6,
          })
          .toFile(outputPath);
          
        responsive[sizeName] = this.getRelativePath(outputPath);
        
      } catch (error) {
        console.error(`❌ Error generating ${sizeName} size:`, error.message);
      }
    }
    
    return responsive;
  }

  /**
   * Get optimized image URL for frontend
   * @param {string} imagePath - Image path
   * @param {string} size - Requested size (thumbnail, small, medium, large)
   * @param {boolean} preferWebP - Prefer WebP format if available
   * @returns {string} Optimized image URL
   */
  getOptimizedImageUrl(imagePath, size = 'medium', preferWebP = true) {
    if (!imagePath) return null;

    // Check if it's already a processed image
    if (imagePath.includes('-thumbnail') || imagePath.includes('-small') || 
        imagePath.includes('-medium') || imagePath.includes('-large')) {
      return imagePath;
    }

    // Try to find responsive version
    const pathParts = imagePath.split('.');
    const extension = pathParts.pop();
    const basePath = pathParts.join('.');
    
    if (preferWebP) {
      const webpPath = `${basePath}-${size}.webp`;
      return webpPath;
    }
    
    return imagePath; // Fallback to original
  }

  /**
   * Clean up old image files
   * @param {string} imagePath - Image path to clean up
   * @returns {Promise<void>}
   */
  async cleanupImage(imagePath) {
    try {
      if (!imagePath) return;
      
      const fullPath = path.join(this.uploadsDir, imagePath);
      
      // Delete main file
      await this.deleteFileIfExists(fullPath);
      
      // Delete responsive versions
      const pathParts = imagePath.split('.');
      const extension = pathParts.pop();
      const basePath = pathParts.join('.');
      
      for (const sizeName of Object.keys(this.responsiveSizes)) {
        const responsivePath = path.join(
          this.uploadsDir, 
          `${basePath}-${sizeName}.webp`
        );
        await this.deleteFileIfExists(responsivePath);
      }
      
      // Delete WebP version
      const webpPath = path.join(this.uploadsDir, `${basePath}.webp`);
      await this.deleteFileIfExists(webpPath);
      
      console.log(`🗑️ Cleaned up image files for: ${imagePath}`);
      
    } catch (error) {
      console.error('❌ Error cleaning up image:', error.message);
    }
  }

  /**
   * Get image processing statistics
   * @returns {Promise<Object>} Processing statistics
   */
  async getStats() {
    try {
      const stats = {
        uploadsDir: this.uploadsDir,
        supportedFormats: this.supportedFormats,
        responsiveSizes: Object.keys(this.responsiveSizes),
        qualitySettings: this.quality,
      };

      // Count files in upload directories
      const subdirectories = ['social-images', 'items', 'categories', 'events', 'offers', 'food-categories'];
      stats.fileCounts = {};
      
      for (const subdir of subdirectories) {
        const subdirPath = path.join(this.uploadsDir, subdir);
        try {
          const files = await fs.readdir(subdirPath);
          stats.fileCounts[subdir] = {
            total: files.length,
            webp: files.filter(f => f.endsWith('.webp')).length,
            responsive: files.filter(f => f.includes('-thumbnail') || f.includes('-small') || f.includes('-medium') || f.includes('-large')).length,
          };
        } catch (error) {
          stats.fileCounts[subdir] = { error: 'Directory not accessible' };
        }
      }

      return stats;
    } catch (error) {
      console.error('❌ Error getting image processing stats:', error.message);
      return { error: error.message };
    }
  }

  // Helper methods

  /**
   * Ensure directory exists
   * @param {string} dirPath - Directory path
   * @returns {Promise<void>}
   */
  async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Get relative path from uploads directory
   * @param {string} fullPath - Full file path
   * @returns {string} Relative path
   */
  getRelativePath(fullPath) {
    return path.relative(this.uploadsDir, fullPath).replace(/\\/g, '/');
  }

  /**
   * Delete file if it exists
   * @param {string} filePath - File path to delete
   * @returns {Promise<void>}
   */
  async deleteFileIfExists(filePath) {
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch (error) {
      // File doesn't exist, ignore
    }
  }
}

// Create singleton instance
const imageProcessor = new ImageProcessor();

module.exports = {
  imageProcessor,
  ImageProcessor,
};
