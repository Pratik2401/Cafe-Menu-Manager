/**
 * @fileoverview Caching Middleware for TopchiOutpost Cafe Management System
 * 
 * This module provides intelligent caching middleware that automatically caches
 * frequently accessed API responses to improve performance and reduce database load.
 * 
 * @author TopchiOutpost Development Team
 * @version 1.0.0
 * @since 2025-01-01
 */

const { cache, CACHE_KEYS, CACHE_TTL } = require('../config/cache');

/**
 * Generic cache middleware factory
 * @param {Function} keyGenerator - Function to generate cache key from request
 * @param {number} ttl - Time to live in seconds
 * @param {Function} shouldCache - Function to determine if response should be cached
 * @returns {Function} Express middleware
 */
const createCacheMiddleware = (keyGenerator, ttl = CACHE_TTL.MEDIUM, shouldCache = null) => {
  return async (req, res, next) => {
    try {
      // Generate cache key
      const cacheKey = typeof keyGenerator === 'function' ? keyGenerator(req) : keyGenerator;
      
      if (!cacheKey) {
        return next();
      }

      // Try to get cached response
      const cachedResponse = await cache.get(cacheKey);
      
      if (cachedResponse) {
        console.log(`📋 Cache hit for key: ${cacheKey}`);
        return res.json(cachedResponse);
      }

      // Cache miss - continue to route handler
      console.log(`📋 Cache miss for key: ${cacheKey}`);
      
      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data) {
        // Check if we should cache this response
        const shouldCacheResponse = shouldCache ? shouldCache(data, res.statusCode) : (res.statusCode === 200);
        
        if (shouldCacheResponse && data) {
          // Cache the response asynchronously
          cache.set(cacheKey, data, ttl).catch(err => {
            console.error(`❌ Failed to cache response for key ${cacheKey}:`, err.message);
          });
          console.log(`📋 Cached response for key: ${cacheKey} (TTL: ${ttl}s)`);
        }
        
        // Call original json method
        return originalJson.call(this, data);
      };
      
      next();
      
    } catch (error) {
      console.error('❌ Cache middleware error:', error.message);
      next(); // Continue without caching on error
    }
  };
};

/**
 * Cache middleware for menu items
 * @description Caches menu items by category and subcategory
 */
const cacheMenuItems = createCacheMiddleware(
  (req) => {
    const { categoryId, subCategoryId } = req.query;
    return CACHE_KEYS.MENU_ITEMS(categoryId, subCategoryId);
  },
  CACHE_TTL.LONG,
  (data, statusCode) => statusCode === 200 && data && Array.isArray(data)
);

/**
 * Cache middleware for categories
 * @description Caches visible categories list
 */
const cacheCategories = createCacheMiddleware(
  () => CACHE_KEYS.CATEGORIES(),
  CACHE_TTL.LONG,
  (data, statusCode) => statusCode === 200 && data && Array.isArray(data)
);

/**
 * Cache middleware for subcategories
 * @description Caches subcategories by category
 */
const cacheSubCategories = createCacheMiddleware(
  (req) => {
    const categoryId = req.params.categoryId || req.query.categoryId;
    return categoryId ? CACHE_KEYS.SUBCATEGORIES(categoryId) : null;
  },
  CACHE_TTL.LONG,
  (data, statusCode) => statusCode === 200 && data && Array.isArray(data)
);

/**
 * Cache middleware for food categories
 * @description Caches food categories list
 */
const cacheFoodCategories = createCacheMiddleware(
  () => CACHE_KEYS.FOOD_CATEGORIES(),
  CACHE_TTL.LONG,
  (data, statusCode) => statusCode === 200 && data && Array.isArray(data)
);

/**
 * Cache middleware for daily offers
 * @description Caches active daily offers
 */
const cacheDailyOffers = createCacheMiddleware(
  () => CACHE_KEYS.DAILY_OFFERS(),
  CACHE_TTL.MEDIUM,
  (data, statusCode) => statusCode === 200 && data && Array.isArray(data)
);

/**
 * Cache middleware for events
 * @description Caches active events
 */
const cacheEvents = createCacheMiddleware(
  () => CACHE_KEYS.EVENTS(),
  CACHE_TTL.MEDIUM,
  (data, statusCode) => statusCode === 200 && data && Array.isArray(data)
);

/**
 * Cache middleware for theme settings
 * @description Caches theme configuration
 */
const cacheThemeSettings = createCacheMiddleware(
  () => CACHE_KEYS.THEME_SETTINGS(),
  CACHE_TTL.VERY_LONG,
  (data, statusCode) => statusCode === 200 && data
);

/**
 * Cache middleware for cafe info
 * @description Caches cafe information
 */
const cacheCafeInfo = createCacheMiddleware(
  () => CACHE_KEYS.CAFE_INFO(),
  CACHE_TTL.VERY_LONG,
  (data, statusCode) => statusCode === 200 && data
);

/**
 * Cache middleware for social links
 * @description Caches social media links
 */
const cacheSocialLinks = createCacheMiddleware(
  () => CACHE_KEYS.SOCIAL_LINKS(),
  CACHE_TTL.VERY_LONG,
  (data, statusCode) => statusCode === 200 && data && Array.isArray(data)
);

/**
 * Cache invalidation middleware
 * @description Invalidates related cache entries when data is modified
 */
const invalidateCache = (patterns = []) => {
  return async (req, res, next) => {
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;
    
    // Override response methods to invalidate cache on successful operations
    const invalidateOnSuccess = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Invalidate cache patterns asynchronously
        Promise.all(patterns.map(pattern => {
          const cachePattern = typeof pattern === 'function' ? pattern(req, data) : pattern;
          return cache.clearPattern(cachePattern);
        })).then(() => {
          console.log(`🗑️ Cache invalidated for patterns: ${patterns.join(', ')}`);
        }).catch(err => {
          console.error('❌ Cache invalidation error:', err.message);
        });
      }
      
      return originalJson.call(this, data);
    };
    
    res.json = invalidateOnSuccess;
    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Invalidate cache patterns asynchronously
        Promise.all(patterns.map(pattern => {
          const cachePattern = typeof pattern === 'function' ? pattern(req, data) : pattern;
          return cache.clearPattern(cachePattern);
        })).then(() => {
          console.log(`🗑️ Cache invalidated for patterns: ${patterns.join(', ')}`);
        }).catch(err => {
          console.error('❌ Cache invalidation error:', err.message);
        });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Predefined cache invalidation patterns
 */
const INVALIDATION_PATTERNS = {
  // Menu-related invalidations
  MENU_ITEMS: ['menu:items:*'],
  CATEGORIES: ['menu:categories:*', 'menu:items:*'],
  SUBCATEGORIES: (req) => [`menu:subcategories:${req.params.categoryId || '*'}`, 'menu:items:*'],
  FOOD_CATEGORIES: ['menu:food-categories:*'],
  
  // Offer and event invalidations
  DAILY_OFFERS: ['offers:daily:*'],
  EVENTS: ['events:*'],
  
  // Static content invalidations
  THEME: ['theme:*'],
  CAFE: ['cafe:*'],
  SOCIAL: ['social:*'],
  
  // Clear all cache
  ALL: ['*'],
};

/**
 * Conditional caching based on user authentication
 * @description Different caching strategies for authenticated vs public users
 */
const conditionalCache = (publicKeyGen, authKeyGen, ttl = CACHE_TTL.MEDIUM) => {
  return createCacheMiddleware(
    (req) => {
      const isAuthenticated = req.user || req.headers.authorization;
      return isAuthenticated ? authKeyGen(req) : publicKeyGen(req);
    },
    ttl
  );
};

/**
 * Cache warming utility
 * @description Pre-populate cache with frequently accessed data
 */
const warmCache = async () => {
  try {
    console.log('🔥 Starting cache warming...');
    
    // This would typically make requests to your own API endpoints
    // to pre-populate the cache with commonly accessed data
    
    // Example: Warm up categories cache
    // await axios.get('/api/customer/category');
    
    console.log('✅ Cache warming completed');
  } catch (error) {
    console.error('❌ Cache warming failed:', error.message);
  }
};

/**
 * Cache monitoring middleware
 * @description Adds cache hit/miss headers for monitoring
 */
const cacheMonitoring = (req, res, next) => {
  // Add cache monitoring headers before response is sent
  const originalSetHeader = res.setHeader;
  const originalSend = res.send;
  const originalJson = res.json;
  
  // Override response methods to add cache headers before sending
  res.send = function(body) {
    if (!res.headersSent) {
      const cacheHit = res.getHeader('X-Cache-Hit') || 'MISS';
      res.setHeader('X-Cache-Status', cacheHit);
    }
    return originalSend.call(this, body);
  };
  
  res.json = function(obj) {
    if (!res.headersSent) {
      const cacheHit = res.getHeader('X-Cache-Hit') || 'MISS';
      res.setHeader('X-Cache-Status', cacheHit);
    }
    return originalJson.call(this, obj);
  };
  
  next();
};

module.exports = {
  // Middleware factories
  createCacheMiddleware,
  conditionalCache,
  
  // Specific cache middleware
  cacheMenuItems,
  cacheCategories,
  cacheSubCategories,
  cacheFoodCategories,
  cacheDailyOffers,
  cacheEvents,
  cacheThemeSettings,
  cacheCafeInfo,
  cacheSocialLinks,
  
  // Cache invalidation
  invalidateCache,
  INVALIDATION_PATTERNS,
  
  // Utilities
  warmCache,
  cacheMonitoring,
};
