import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL_CUSTOMER || 'https://topchioutpost.snap2eat.in/api/customer';

// Create axios instance with base URL
const customerAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000, // 10 second timeout
});

// Simple response interceptor for error handling only
customerAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded. Please wait before making more requests.');
      return Promise.reject(new Error('Too many requests. Please wait and try again.'));
    }
    return Promise.reject(error);
  }
);
export const createFeedback = (feedbackData) => customerAPI.post('/feedback', feedbackData);

// Food category endpoints
export const getFoodCategories = () => customerAPI.get('/food-categories');
export const getFoodCategoryById = (id) => customerAPI.get(`/food-categories/${id}`);

// Cafe endpoints
export const getCafe = () => customerAPI.get('/cafe');
export const getCafeSettings = () => customerAPI.get('/cafe/settings');

// User Info Settings - Using localStorage instead of API call

// Item endpoints
export const getAllItems = (includeHidden = false) => {
  const showParam = includeHidden ? '' : '?show=true';
  return customerAPI.get(`/items${showParam}`);
};
export const getItemById = (id) => customerAPI.get(`/items/${id}`);

// Category endpoints
export const getAllCategories = () => customerAPI.get('/category');
export const getCategoryById = (id) => customerAPI.get(`/category/${id}`);

// Subcategory endpoints
export const getAllSubCategories = () => customerAPI.get('/subcategories');
export const getSubCategoryById = (id) => customerAPI.get(`/subcategories/${id}`);

// Size endpoints
export const getAllSizes = () => customerAPI.get('/sizes');
export const getSizeById = (id) => customerAPI.get(`/sizes/${id}`);

// Event endpoints
export const getActiveEvents = () => customerAPI.get('/events');
export const getEventById = (id) => customerAPI.get(`/events/${id}`);

// Social endpoints
export const getAllSocials = () => customerAPI.get('/socials');

// Tag endpoints
export const getAllTags = () => customerAPI.get('/tags');
export const getTagById = (id) => customerAPI.get(`/tags/${id}`);

// Variation endpoints
export const getAllVariations = () => customerAPI.get('/variations');
export const getVariationById = (id) => customerAPI.get(`/variations/${id}`);

// Daily Offers endpoints
export const getActiveDailyOffers = () => customerAPI.get('/daily-offers');
export const getDailyOfferById = (id) => customerAPI.get(`/daily-offers/${id}`);

// Allergy endpoints
export const getAllAllergies = () => customerAPI.get('/allergies');
export const getAllergyById = (id) => customerAPI.get(`/allergies/${id}`);

// Image Upload endpoints
export const getAllImageUploads = () => customerAPI.get('/image-uploads');


/**
 * Fetch all sizes
 * @returns {Promise<Array>} - List of all sizes
 */
export const fetchAllSizes = async () => {
  try {
    const response = await axios.get(`${API_URL}/sizes/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sizes:', error);
    throw error;
  }
};

/**
 * Fetch size by ID
 * @param {string} sizeId - The size's unique ID
 * @returns {Promise<Object>} - Size data
 */
export const fetchSizeById = async (sizeId) => {
  try {
    const response = await axios.get(`${API_URL}/sizes/${sizeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching size:', error);
    throw error;
  }
};

/**
 * Create a new size
 * @param {Object} sizeData - The size data
 * @returns {Promise<Object>} - Created size data
 */
export const createSize = async (sizeData) => {
  try {
    const response = await axios.post(`${API_URL}/sizes/`, sizeData);
    return response.data;
  } catch (error) {
    console.error('Error creating size:', error);
    throw error;
  }
};

/**
 * Update a size
 * @param {string} sizeId - The size's unique ID
 * @param {Object} sizeData - The updated size data
 * @returns {Promise<Object>} - Updated size data
 */
export const updateSize = async (sizeId, sizeData) => {
  try {
    const response = await axios.put(`${API_URL}/sizes/${sizeId}`, sizeData);
    return response.data;
  } catch (error) {
    console.error('Error updating size:', error);
    throw error;
  }
};

/**
 * Delete a size
 * @param {string} sizeId - The size's unique ID
 * @returns {Promise<Object>} - Response data
 */
export const deleteSize = async (sizeId) => {
  try {
    const response = await axios.delete(`${API_URL}/sizes/${sizeId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting size:', error);
    throw error;
  }
};

/**
 * Add size to item
 * @param {string} itemId - The item's unique ID
 * @param {string} sizeId - The size's unique ID
 * @param {Object} data - Additional data like price
 * @returns {Promise<Object>} - Response data
 */
export const addSizeToItem = async (itemId, sizeId, data) => {
  try {
    const response = await axios.post(`${API_URL}/sizes/${itemId}/add/${sizeId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error adding size to item:', error);
    throw error;
  }
};

/**
 * Remove size from item
 * @param {string} itemId - The item's unique ID
 * @param {string} sizeId - The size's unique ID
 * @returns {Promise<Object>} - Response data
 */
export const removeSizeFromItem = async (itemId, sizeId) => {
  try {
    const response = await axios.delete(`${API_URL}/sizes/${itemId}/remove/${sizeId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing size from item:', error);
    throw error;
  }
};

/**
 * Get all events
 * @param {Object} params - Query parameters (active=true|false)
 * @returns {Promise<Array>} - List of events
 */
export const getAllEvents = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/events/`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const fetchFoodCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/food-categories`);
    return response.data;
  } catch (error) {
    console.error("Error fetching food categories:", error);
    throw error;
  }
};

// User Info endpoints
export const createUserInfo = (userInfoData) => customerAPI.post('/user-info', userInfoData);
export const getUserInfoByEmail = (email) => customerAPI.get(`/user-info/${email}`);

export default customerAPI;