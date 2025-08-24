/**
 * @fileoverview API Caching Hook for Optimized Data Fetching
 * Prevents multiple API calls by caching responses and sharing data across components
 */

import { useState, useEffect, useRef } from 'react';

// Global cache to store API responses
const apiCache = new Map();
const pendingRequests = new Map();

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const STALE_WHILE_REVALIDATE = 10 * 60 * 1000; // 10 minutes

/**
 * Custom hook for cached API calls
 * @param {string} cacheKey - Unique key for caching
 * @param {Function} apiCall - Function that returns a promise
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useApiCache = (cacheKey, apiCall, options = {}) => {
  const {
    enabled = true,
    staleTime = CACHE_DURATION,
    cacheTime = STALE_WHILE_REVALIDATE,
    dependencies = []
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchData = async (forceRefresh = false) => {
    if (!enabled || !apiCall) return;

    const now = Date.now();
    const cached = apiCache.get(cacheKey);

    // Return cached data if fresh and not forcing refresh
    if (!forceRefresh && cached && (now - cached.timestamp) < staleTime) {
      if (mountedRef.current) {
        setData(cached.data);
        setLoading(false);
        setError(null);
      }
      return cached.data;
    }

    // Check if request is already pending
    if (pendingRequests.has(cacheKey)) {
      try {
        const result = await pendingRequests.get(cacheKey);
        if (mountedRef.current) {
          setData(result);
          setLoading(false);
          setError(null);
        }
        return result;
      } catch (err) {
        if (mountedRef.current) {
          setError(err);
          setLoading(false);
        }
        throw err;
      }
    }

    // Set loading state
    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    // Create and store the pending request
    const requestPromise = apiCall()
      .then(response => {
        const result = response?.data || response;
        
        // Cache the result
        apiCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });

        if (mountedRef.current) {
          setData(result);
          setLoading(false);
          setError(null);
        }

        return result;
      })
      .catch(err => {
        console.error(`API call failed for ${cacheKey}:`, err);
        
        if (mountedRef.current) {
          setError(err);
          setLoading(false);
        }
        
        throw err;
      })
      .finally(() => {
        // Remove from pending requests
        pendingRequests.delete(cacheKey);
      });

    pendingRequests.set(cacheKey, requestPromise);

    try {
      return await requestPromise;
    } catch (err) {
      // Return stale data if available
      if (cached && (now - cached.timestamp) < cacheTime) {
        if (mountedRef.current) {
          setData(cached.data);
          setLoading(false);
          setError(null);
        }
        return cached.data;
      }
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
  }, [cacheKey, enabled, ...dependencies]);

  const refetch = () => fetchData(true);

  return {
    data,
    loading,
    error,
    refetch
  };
};

/**
 * Clear specific cache entry
 * @param {string} cacheKey - Key to clear
 */
export const clearCache = (cacheKey) => {
  apiCache.delete(cacheKey);
  pendingRequests.delete(cacheKey);
};

/**
 * Clear all cache entries
 */
export const clearAllCache = () => {
  apiCache.clear();
  pendingRequests.clear();
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => ({
  cacheSize: apiCache.size,
  pendingRequests: pendingRequests.size,
  cacheKeys: Array.from(apiCache.keys())
});