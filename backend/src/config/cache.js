/**
 * @fileoverview Cache Configuration for TopchiOutpost Cafe Management System
 * 
 * This module provides Redis and in-memory caching solutions for frequently
 * accessed data like menu items, categories, and theme settings.
 * 
 * @author TopchiOutpost Development Team
 * @version 1.0.0
 * @since 2025-01-01
 */

const Redis = require('ioredis');
const memoryCache = require('memory-cache');

/**
 * Redis client configuration
 * @description Production-ready Redis client with connection pooling and retry logic
 */
let redisClient = null;

/**
 * Initialize Redis connection
 * @description Creates Redis client with optimized settings for production
 * @returns {Redis|null} Redis client instance or null if connection fails
 */
const initRedis = () => {
  try {
    const redisUrl = process.env.REDIS_URL || process.env.REDISCLOUD_URL;
    
    if (!redisUrl) {
      console.warn('⚠️ Redis URL not configured, using memory cache only');
      return null;
    }

    redisClient = new Redis(redisUrl, {
      // Connection settings
      connectTimeout: 10000,
      lazyConnect: true,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      
      // Performance settings
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      keepAlive: 30000,
      
      // Retry configuration
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        console.log(`🔄 Retrying Redis connection in ${delay}ms (attempt ${times})`);
        return delay;
      },
      
      // Connection events
      onClusterReady: () => console.log('✅ Redis cluster ready'),
      onFailover: () => console.log('🔄 Redis failover occurred'),
      onNodeError: (err) => console.error('❌ Redis node error:', err.message),
    });

    // Event handlers
    redisClient.on('connect', () => {
      console.log('✅ Connected to Redis');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
    });

    redisClient.on('close', () => {
      console.log('⚠️ Redis connection closed');
    });

    return redisClient;
    
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error.message);
    return null;
  }
};

/**
 * Cache service with fallback to memory cache
 * @description Provides unified caching interface with Redis primary and memory fallback
 */
class CacheService {
  constructor() {
    this.redis = initRedis();
    this.memCache = memoryCache;
  }

  /**
   * Set cache value with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache (will be JSON stringified)
   * @param {number} ttl - Time to live in seconds (default: 1 hour)
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value, ttl = 3600) {
    try {
      const stringValue = JSON.stringify(value);
      
      if (this.redis && this.redis.status === 'ready') {
        await this.redis.setex(key, ttl, stringValue);
        return true;
      } else {
        // Fallback to memory cache (TTL in milliseconds)
        this.memCache.put(key, stringValue, ttl * 1000);
        return true;
      }
    } catch (error) {
      console.error(`❌ Cache set error for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Get cache value
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Cached value or null if not found
   */
  async get(key) {
    try {
      let value = null;
      
      if (this.redis && this.redis.status === 'ready') {
        value = await this.redis.get(key);
      } else {
        // Fallback to memory cache
        value = this.memCache.get(key);
      }
      
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`❌ Cache get error for key ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Delete cache value
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async del(key) {
    try {
      if (this.redis && this.redis.status === 'ready') {
        await this.redis.del(key);
      } else {
        this.memCache.del(key);
      }
      return true;
    } catch (error) {
      console.error(`❌ Cache delete error for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Clear cache by pattern
   * @param {string} pattern - Pattern to match keys (Redis glob pattern)
   * @returns {Promise<boolean>} Success status
   */
  async clearPattern(pattern) {
    try {
      if (this.redis && this.redis.status === 'ready') {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        // Memory cache doesn't support pattern deletion, clear all
        this.memCache.clear();
      }
      return true;
    } catch (error) {
      console.error(`❌ Cache clear pattern error for ${pattern}:`, error.message);
      return false;
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache usage statistics
   */
  async getStats() {
    try {
      const stats = {
        type: this.redis && this.redis.status === 'ready' ? 'redis' : 'memory',
        connected: this.redis ? this.redis.status === 'ready' : true,
        memoryUsage: process.memoryUsage(),
      };

      if (this.redis && this.redis.status === 'ready') {
        const info = await this.redis.info('memory');
        stats.redisMemory = info;
      } else {
        stats.memoryCacheSize = this.memCache.size();
      }

      return stats;
    } catch (error) {
      console.error('❌ Error getting cache stats:', error.message);
      return { error: error.message };
    }
  }

  /**
   * Close cache connections
   * @returns {Promise<void>}
   */
  async close() {
    try {
      if (this.redis) {
        await this.redis.quit();
      }
      this.memCache.clear();
      console.log('🔌 Cache connections closed');
    } catch (error) {
      console.error('❌ Error closing cache connections:', error.message);
    }
  }
}

// Cache key generators for consistent naming
const CACHE_KEYS = {
  // Menu data caching (1 hour TTL)
  MENU_ITEMS: (categoryId, subCategoryId, show) => `menu:items:${categoryId}:${subCategoryId || 'all'}:${show || 'all'}`,
  CATEGORIES: () => 'menu:categories:visible',
  SUBCATEGORIES: (categoryId) => `menu:subcategories:${categoryId}`,
  FOOD_CATEGORIES: () => 'menu:food-categories:visible',
  
  // Daily offers and events (30 minutes TTL)
  DAILY_OFFERS: () => 'offers:daily:active',
  EVENTS: () => 'events:active',
  
  // Static content (24 hours TTL)
  THEME_SETTINGS: () => 'theme:settings',
  CAFE_INFO: () => 'cafe:info',
  SOCIAL_LINKS: () => 'social:links',
  
  // Analytics and feedback (1 hour TTL)
  FEEDBACK_SUMMARY: () => 'analytics:feedback:summary',
  USER_STATS: () => 'analytics:users:stats',
};

// Cache TTL constants (in seconds)
const CACHE_TTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1800,    // 30 minutes
  LONG: 3600,      // 1 hour
  VERY_LONG: 86400, // 24 hours
};

// Create singleton instance
const cacheService = new CacheService();

module.exports = {
  cache: cacheService,
  CACHE_KEYS,
  CACHE_TTL,
};
