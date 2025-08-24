/**
 * @fileoverview Optimized API Hooks for Common Data Fetching
 * Provides cached hooks for frequently used API calls
 */

import { useApiCache } from './useApiCache';
import { 
  getAllCategories, 
  getAllSubCategories, 
  getActiveEvents, 
  getAllSocials, 
  getActiveDailyOffers, 
  getCafeSettings 
} from '../api/customer';

/**
 * Hook for fetching categories with caching
 */
export const useCategories = (options = {}) => {
  return useApiCache('categories', getAllCategories, {
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    ...options
  });
};

/**
 * Hook for fetching subcategories with caching
 */
export const useSubCategories = (options = {}) => {
  return useApiCache('subcategories', getAllSubCategories, {
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options
  });
};

/**
 * Hook for fetching events with caching
 */
export const useEvents = (options = {}) => {
  return useApiCache('events', getActiveEvents, {
    staleTime: 5 * 60 * 1000, // 5 minutes - events change more frequently
    ...options
  });
};

/**
 * Hook for fetching social media links with caching
 */
export const useSocials = (options = {}) => {
  return useApiCache('socials', getAllSocials, {
    staleTime: 15 * 60 * 1000, // 15 minutes - socials rarely change
    ...options
  });
};

/**
 * Hook for fetching daily offers with caching
 */
export const useDailyOffers = (options = {}) => {
  return useApiCache('daily-offers', getActiveDailyOffers, {
    staleTime: 2 * 60 * 1000, // 2 minutes - offers are time-sensitive
    ...options
  });
};

/**
 * Hook for fetching cafe settings with caching
 */
export const useCafeSettings = (options = {}) => {
  return useApiCache('cafe-settings', getCafeSettings, {
    staleTime: 10 * 60 * 1000, // 10 minutes - settings don't change often
    ...options
  });
};