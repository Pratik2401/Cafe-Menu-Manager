/**
 * @fileoverview Admin API Service Layer for TopchiOutpost Management System
 * 
 * This module provides a comprehensive API interface for all admin operations
 * including authentication, menu management, event handling, and system configuration.
 * All functions handle authentication, error management, and response formatting.
 * 
 * @author TopchiOutpost Development Team
 * @version 1.0.0
 * @since 2025-01-01
 * 
 * @requires axios - HTTP client for API requests
 * @requires ../utils/tokenManager.js - JWT token management utilities
 */

import axios from "axios";
import { getValidToken, setTokenWithExpiry } from '../utils/tokenManager.js';

// ========================================================================================
// API CONFIGURATION
// ========================================================================================

/**
 * Base API URL for admin endpoints
 * @description Uses environment variable with fallback to production URL
 */
const API_URL = import.meta.env.VITE_API_URL_ADMIN || "https://topchioutpost.snap2eat.in/api/admin";

// ========================================================================================
// UTILITY FUNCTIONS
// ========================================================================================

/**
 * Convert base64 string to File object for uploads
 * @description Utility function for handling base64 image data in forms
 * @param {string} base64String - Base64 encoded string with data URL prefix
 * @param {string} filename - Desired filename for the file
 * @returns {File} File object suitable for FormData
 * 
 * @example
 * const file = base64ToFile('data:image/jpeg;base64,/9j/4AAQ...', 'image.jpg');
 * formData.append('image', file);
 */
const base64ToFile = (base64String, filename) => {
  const arr = base64String.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

// ========================================================================================
// CATEGORY MANAGEMENT API
// ========================================================================================

/**
 * Create a new category
 * @description Creates a new menu category with image upload support
 * @param {FormData} formData - Form data containing category information and image
 * @returns {Promise<Object>} Created category data
 * @throws {Error} If category creation fails
 * 
 * @example
 * const formData = new FormData();
 * formData.append('name', 'Beverages');
 * formData.append('image', imageFile);
 * formData.append('serialId', 1);
 * const category = await createCategory(formData);
 */
export const createCategory = async (formData) => {
  const token = localStorage.getItem('adminToken');
  const response = await fetch(`${API_URL}/category`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to create category");
  }

  return response.json();
};


    //** 🔹 Update a Category

    export const updateCategory = async (categoryId, categoryData) => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.put(`${API_URL}/category/${categoryId}`, categoryData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        return res.data;
      } catch (error) {
        console.error("Error updating category:", error);
        throw error;
      }
    };



    /** 🔹 Delete a Category
     * @param {string} categoryId
     */
    export const deleteCategory = async (categoryId) => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.delete(`${API_URL}/category/${categoryId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return res.data;
      } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
      }
    };
    /** 🔹 Update only the serialId of a Category
     * @param {string} categoryId
     * @param {number} serialId
     */
    export const updateCategorySerialId = async (categoryId, serialId) => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.patch(
          `${API_URL}/category/${categoryId}/serial`,
          { serialId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return res.data;
      } catch (error) {
        console.error("Error updating category serialId:", error);
        throw error;
      }
    };

    // Admin Login
    export const AdminLogin = async (email, password) => {
      try {
        const res = await axios.post(
          `${API_URL}/auth/login`,
          { email, password }
        );
        // Save token to localStorage with expiration if present in response
        if (res.data && res.data.token) {
          setTokenWithExpiry(res.data.token, 4); // 4 hours
        }
        return res.data;
      } catch (error) {
        console.error("Error logging in admin:", error);
        throw error;
      }
    };

    // Admin Forgot Password
    export const AdminForgotPassword = async (email) => {
      try {
        const res = await axios.post(
          `${API_URL}/auth/forgot-password`,
          { email }
        );
        return res.data;
      } catch (error) {
        console.error("Error sending forgot password:", error);
        throw error;
      }
    };

    // Admin Reset Password
    export const AdminResetPassword = async (otp, password) => {
      try {
        const res = await axios.post(
          `${API_URL}/auth/reset-password`,
          { otp, password }
        );
        return res.data;
      } catch (error) {
        console.error("Error resetting password:", error);
        throw error;
      }
    };

    /** 🔹 Toggle visibility of a Category
     * @param {string} categoryId
     */
    export const toggleCategoryVisibility = async (categoryId, newVisibility) => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.patch(
          `${API_URL}/category/${categoryId}/toggle-visibility`,
          { isVisible: newVisibility },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return res.data;
      } catch (error) {
        console.error("Error toggling category visibility:", error);
        throw error;
      }
    };



    /** 🔹 Fetch All Items */
 export const fetchAllItems = async () => {
  try {
    const res = await axios.get(`${API_URL}/items/`);
    return res.data;
  } catch (error) {
    console.error("Error fetching Items:", error);
    throw error;
  }
};
    /** 🔹 Fetch All Categories */
    export const fetchAllCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/category`);
        return res.data;
      } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
    }
    /** 🔹 Create SubCategories (multiple) */
    export const createSubCategories = async (subCategoriesArray) => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.post(`${API_URL}/subcategories`, [subCategoriesArray], {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return res.data;
      } catch (error) {
        console.error("Error creating subcategories:", error);
        throw error;
      }
    };

    /** 🔹 Get all SubCategories */
    export const fetchAllSubCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/subcategories`);
        return res.data;
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        throw error;
      }
    };

    /** 🔹 Get SubCategory by ID */
    export const fetchSubCategoryById = async (id) => {
      try {
        const res = await axios.get(`${API_URL}/subcategories/${id}`);
        return res.data;
      } catch (error) {
        console.error("Error fetching subcategory by ID:", error);
        throw error;
      }
    };

    /** 🔹 Update SubCategory */
    export const updateSubCategory = async (id, data) => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.put(`${API_URL}/subcategories/${id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return res.data;
      } catch (error) {
        console.error("Error updating subcategory:", error);
        throw error;
      }
    };

    /** 🔹 Delete SubCategory */
    export const deleteSubCategory = async (id) => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.delete(`${API_URL}/subcategories/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return res.data;
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        throw error;
      }
    };

    /** 🔹 Get SubCategories by Category ID */
    export const fetchSubCategoriesByCategoryId = async (categoryId) => {
      try {
        const res = await axios.get(`${API_URL}/subcategories/category/${categoryId}`);
        return res.data;
      } catch (error) {
        console.error("Error fetching subcategories by category:", error);
        throw error;
      }
    };

    /** 🔹 Toggle SubCategory Visibility */
    export const toggleSubCategoryVisibility = async (id, newVisibility) => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.patch(
          `${API_URL}/subcategories/${id}/toggle-visibility`,
          { isVisible: newVisibility },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return res.data;
      } catch (error) {
        console.error("Error toggling subcategory visibility:", error);
        throw error;
      }
    };

    /** 🔹 Update only the serialId of a SubCategory
     * @param {string} subCategoryId
     * @param {number} serialId
     */
    export const updateSubCategorySerialId = async (subCategoryId, serialId) => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.patch(
          `${API_URL}/subcategories/${subCategoryId}/serial`,
          { serialId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return res.data;
      } catch (error) {
        console.error("Error updating subcategory serialId:", error);
        throw error;
      }
    };

    /** 🔹 Fetch Items by SubCategory ID */
    export const fetchItemsBySubCategoryId = async (subCategoryId) => {
      try {
        const res = await axios.get(`${API_URL}/items`, {
          params: { subCategory: subCategoryId }
        });
        return res.data;
      } catch (error) {
        console.error("Error fetching items by subCategoryId:", error);
        throw error;
      }
    };


    /** 🔹 Bulk update serial IDs for items */
    export const updateItemSerials = async (itemsPayload) => {
      try {
        const token = localStorage.getItem('adminToken');
        console.log('Sending updateItemSerials request:', {
          url: `${API_URL}/items/update-serials`,
          payload: itemsPayload
        });
        const res = await axios.put(`${API_URL}/items/update-serials`, itemsPayload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        });
        console.log('updateItemSerials response:', res.data);
        return res.data;
      } catch (error) {
        console.error('Error updating item serials:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: `${API_URL}/items/update-serials`,
          payload: itemsPayload
        });
        throw error;
      }
    };


    export const fetchItems = async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/items${query ? `?${query}` : ''}`);

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      return response.json();
    };

    export const fetchItemById = async (id) => {
      const response = await fetch(`${API_URL}/items/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch item');
      }
      return response.json();
    };

    // createItem accepts JSON or FormData (for image upload)
    export const createItem = async (data) => {
      const token = localStorage.getItem('adminToken');
      const options = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (data instanceof FormData) {
        options.body = data; // multipart/form-data, browser sets headers automatically
      } else {
        options.headers = { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        };
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${API_URL}/items`, options);

      if (!response.ok) {
        throw new Error('Failed to create item');
      }
      return response.json();
    };

    // updateItem supports JSON or FormData (for image upload)
    export const updateItem = async (id, data) => {
      try {
        const token = localStorage.getItem('adminToken');
        const options = {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        if (data instanceof FormData) {
          // For FormData, ensure all JSON fields are properly stringified
          ['sizePrices', 'addOns', 'allergens', 'tags', 'tagIds', 'fieldVisibility'].forEach(field => {
            if (data.has(field)) {
              const fieldValue = data.get(field);
              if (typeof fieldValue === 'string') {
                // Already stringified, keep as is
              } else if (fieldValue) {
                // If it's an object, stringify it
                data.set(field, JSON.stringify(fieldValue));
              }
            }
          });
          options.body = data;
        } else {
          // For JSON data
          options.headers = { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          };
          options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_URL}/items/${id}`, options);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error:', errorText);
          throw new Error('Failed to update item');
        }
        return response.json();
      } catch (error) {
        console.error('Error in updateItem:', error);
        throw error;
      }
    };

    export const deleteItem = async (id) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/items/${id}`, { 
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      return response.json();
    };

    export const updateItemAvailability = async (id, show) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/items/${id}/availability`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ show }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item availability');
      }
      return response.json();
    };

    /**
   * Get all social entries
   */
  export const getAllSocials = async () => {
    const res = await fetch(`${API_URL}/socials/`);
    if (!res.ok) throw new Error("Failed to fetch socials");
    const response = await res.json();
    return response.data || response || [];
  };

  /**
   * Get a social entry by ID
   * @param {string} id
   */
  export const getSocialById = async (id) => {
    const res = await fetch(`${API_URL}/socials/${id}`);
    if (!res.ok) throw new Error("Failed to fetch social by ID");
    return res.json();
  };

  /**
   * Create a new social entry
   * @param {FormData} formData - FormData with name, url, isVisible, and icon file
   */
  export const createSocial = async (formData) => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await axios.post(`${API_URL}/socials/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error in createSocial:', error);
      throw error;
    }
  };

  /**
   * Update a social entry by ID
   * @param {string} id
   * @param {FormData|Object} data - FormData for icon updates or Object for other fields
   */
  export const updateSocial = async (id, data) => {
    const token = localStorage.getItem('adminToken');
    
    try {
      if (data instanceof FormData) {
        const response = await axios.put(`${API_URL}/socials/${id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        return response.data;
      } else {
        const options = {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data)
        };

        const res = await fetch(`${API_URL}/socials/${id}`, options);
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Server error:', errorText);
          throw new Error("Failed to update social");
        }
        return res.json();
      }
    } catch (error) {
      console.error('Error in updateSocial:', error);
      throw error;
    }
  };

  /**
   * Delete a social entry by ID
   * @param {string} id
   */
  export const deleteSocial = async (id) => {
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${API_URL}/socials/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to delete social");
    return res.json();
  };

  /**
   * Toggle visibility of a social entry by ID
   * @param {string} id
   * @param {boolean} isVisible
   */
  export const toggleSocialVisibility = async (id, isVisible) => {
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${API_URL}/socials/${id}/toggle-visibility`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isVisible }),
    });
    if (!res.ok) throw new Error("Failed to toggle social visibility");
    return res.json();
  };

  /**
   * Update social media serial order
   * @param {Array} socials - Array of social media with updated serialId
   */
  export const updateSocialSerials = async (socials) => {
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${API_URL}/socials/update-serials`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ socials }),
    });
    if (!res.ok) throw new Error("Failed to update social order");
    return res.json();
  };


  // ─────────────────────────────
  // ORDER ROUTES (Client/Admin Side)
  // ─────────────────────────────

  // 1. Create a new order
  export const createOrder = async (orderData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(`${API_URL}/orders/`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  // 2. Get all orders (filters: ?status=&paymentStatus=&date=)
export const getAllOrders = async (params = {}) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/orders/`, { 
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};
  // 3. Get a single order by ID
  export const getOrderById = async (orderId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Return the data directly to be consistent with other API functions
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  };

  // 4. Update order status and tracking
  export const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(`${API_URL}/orders/${orderId}/status`, { status }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  // 5. Update payment status/type of a single order
  export const updatePaymentStatus = async (orderId, paymentData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(`${API_URL}/orders/${orderId}/payment`, paymentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  };

  // 6. Delete (cancel) an order
  export const deleteOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(`${API_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };

  // 7. Get all orders for a specific table
  export const getOrdersByTable = async (tableNo) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/orders/table/${tableNo}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders by table:', error);
      throw error;
    }
  };

  // 8. Get all active (non-completed) orders
  export const getActiveOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/orders/active`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching active orders:', error);
      throw error;
    }
  };

  // 9. Get grouped pending orders for payment (by mobileNo + tableNo)
  export const getGroupedOrdersForPayment = async (mobileNo, tableNo) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/orders/grouped/payment`, { 
        params: { mobileNo, tableNo },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching grouped orders for payment:', error);
      throw error;
    }
  };

  // 10. Mark all orders for given mobileNo and tableNo as paid
  export const markOrdersAsPaid = async (mobileNo, tableNo) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(`${API_URL}/orders/grouped/pay`, { mobileNo, tableNo }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error marking orders as paid:', error);
      throw error;
    }
  };

  // 11. Get grouped pending orders by mobileNo for a table
  export const getGroupedOrdersForTable = async (tableNo) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/orders/grouped/table`, { 
        params: { tableNo },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching grouped orders for table:', error);
      throw error;
    }
  };

  // 12. Pay selected individual orders
  export const paySelectedOrders = async (orderIds) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(`${API_URL}/orders/pay-selected`, { orderIds }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error paying selected orders:', error);
      throw error;
    }
  };

  /**
 * Add an item to an order.
 * @param {string} orderId - The ID of the order.
 * @param {object} item - The item to add.
 * @returns {Promise<object>} - The updated order.
 */
export const addItemToOrder = async (orderId, item) => {
  try {
    const token = localStorage.getItem('adminToken');
    console.log(`Adding item to order ${orderId}:`, item);
    const payload = {
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      note: item.note || "",
      addOns: item.addOns || [],
      allergens: item.allergens || []
    };
    const response = await axios.post(`${API_URL}/orders/${orderId}/additem`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding item to order:', error);
    throw error;
  }
};
/**
 * Remove an item from an order.
 * @param {string} orderId - The ID of the order.
 * @param {string} itemId - The ID of the item to remove.
 * @returns {Promise<object>} - The updated order.
 */
export const removeItemFromOrder = async (orderId, itemId) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.delete(`${API_URL}/orders/${orderId}/items/${itemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error removing item from order:', error);
    throw error;
  }
};
/**
 * Update payment status of an order
 * @param {string} orderId - The ID of the order
 * @param {string} paymentStatus - The new payment status ('paid' or 'pending')
 * @returns {Promise<object>} - The updated order
 */
export const updateOrderPaymentStatus = async (orderId, paymentStatus) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.patch(`${API_URL}/orders/${orderId}/payment`, { 
      paymentStatus 
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};


/**
 * Fetch pending payments for a specific table.
 * @param {string} tableNo - The table number to fetch pending payments for.
 * @returns {Promise<Object>} - The response data containing pending payments.
 */
export const getPendingPaymentsByTable = async (tableNo) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/orders/table/${tableNo}/pending-payments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching pending payments by table:', error);
    throw error;
  }
};
/**
 * Get a completed order by ID for payment view.
 * @param {string} orderId - The ID of the order to fetch.
 * @returns {Promise<Object>} - The completed order with pending payment.
 */
export const getCompletedOrderById = async (orderId) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/orders/completed/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching completed order for payment:', error);
    throw error;
  }
};

// ─────────────────────────────
// USER ROUTES (CRM functionality)
// ─────────────────────────────

/**
 * Get all users
 * @returns {Promise<Array>} - List of all users
 */
export const getAllUsers = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/users/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Get user by ID
 * @param {string} userId - The user's unique ID
 * @returns {Promise<Object>} - User data
 */
export const getUserById = async (userId) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

/**
 * Create a new user
 * @param {Object} userData - User data including name, phoneNumber, etc.
 * @returns {Promise<Object>} - Created user data
 */
export const createUser = async (userData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.post(`${API_URL}/users/`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Update an existing user
 * @param {string} userId - The user's unique ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} - Updated user data
 */
export const updateUser = async (userId, userData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.put(`${API_URL}/users/${userId}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Delete a user
 * @param {string} userId - The user's unique ID
 * @returns {Promise<Object>} - Response data
 */
export const deleteUser = async (userId) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.delete(`${API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * Get all orders for a specific user
 * @param {string} userId - The user's unique ID
 * @returns {Promise<Array>} - List of user's orders
 */
export const getUserOrders = async (userId) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/users/${userId}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

/**
 * Search users by name or phone number
 * @param {string} query - Search query
 * @returns {Promise<Array>} - List of matching users
 */
export const searchUsers = async (query) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/users/search/query`, {
      params: { query },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

/**
 * Update user loyalty points
 * @param {string} userId - The user's unique ID
 * @param {number} points - Points to add, subtract, or set
 * @param {string} operation - Operation type: 'add', 'subtract', or 'set'
 * @returns {Promise<Object>} - Updated user data
 */
export const updateUserLoyaltyPoints = async (userId, points, operation) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.patch(`${API_URL}/users/${userId}/loyalty`, {
      points,
      operation
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating loyalty points:', error);
    throw error;
  }
};

// ─────────────────────────────
// EVENT ROUTES (CRM functionality)
// ─────────────────────────────

/**
 * Create a new event with offers
 * @param {Object} eventData - Event data including offers
 * @returns {Promise<Object>} - Created event data
 */
export const createEvent = async (eventData) => {
  try {
    const token = localStorage.getItem('adminToken');
    // Ensure item names are included in offers
    if (eventData.offers && eventData.offers.length > 0) {
      eventData.offers = eventData.offers.map(offer => {
        if (offer.items && offer.items.length > 0) {
          // Make sure each item has a name
          offer.items = offer.items.map(item => {
            if (!item.name && item.itemId) {
              // Try to find the name from itemDetails if available
              const itemDetail = offer.itemDetails?.find(detail => detail._id === item.itemId);
              if (itemDetail) {
                return { ...item, name: itemDetail.name };
              }
            }
            return item;
          });
        }
        return offer;
      });
    }
    
    const response = await axios.post(`${API_URL}/events/`, eventData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

/**
 * Create a new event offer
 * @param {Object} offerData - Event offer data
 * @returns {Promise<Object>} - Created event offer data
 */
export const createEventOffer = async (offerData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.post(`${API_URL}/event-offers/`, offerData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating event offer:', error);
    throw error;
  }
};

/**
 * Create a new event item
 * @param {Object} itemData - Event item data
 * @returns {Promise<Object>} - Created event item data
 */


/**
 * Get all event items
 * @param {Object} params - Query parameters (eventId)
 * @returns {Promise<Array>} - List of event items
 */
export const getAllEventItems = async (params = {}) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/event-items/`, { 
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching event items:', error);
    throw error;
  }
};

/**
 * Create a new event-specific item
 * @param {Object} itemData - Event item data
 * @returns {Promise<Object>} - Created event item data
 */
export const createEventItem = async (itemData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.post(`${API_URL}/event-items/`, itemData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating event item:', error);
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
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/events/`, { 
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

/**
 * Get event by ID
 * @param {string} eventId - The event's unique ID
 * @returns {Promise<Object>} - Event data
 */
export const getEventById = async (eventId) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

/**
 * Update an existing event with offers
 * @param {string} eventId - The event's unique ID
 * @param {Object} eventData - Updated event data including offers
 * @returns {Promise<Object>} - Updated event data
 */
export const updateEvent = async (eventId, eventData) => {
  try {
    // Ensure item names are included in offers
    if (eventData.offers && eventData.offers.length > 0) {
      eventData.offers = eventData.offers.map(offer => {
        if (offer.items && offer.items.length > 0) {
          // Make sure each item has a name
          offer.items = offer.items.map(item => {
            if (!item.name && item.itemId) {
              // Try to find the name from itemDetails if available
              const itemDetail = offer.itemDetails?.find(detail => detail._id === item.itemId);
              if (itemDetail) {
                return { ...item, name: itemDetail.name };
              }
            }
            return item;
          });
        }
        return offer;
      });
    }
    
    const response = await axios.put(`${API_URL}/events/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

/**
 * Delete an event
 * @param {string} eventId - The event's unique ID
 * @returns {Promise<Object>} - Response data
 */
export const deleteEvent = async (eventId) => {
  try {
    const response = await axios.delete(`${API_URL}/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

/**
 * Toggle event active status
 * @param {string} eventId - The event's unique ID
 * @param {boolean} isActive - The new active status
 * @returns {Promise<Object>} - Updated event status
 */
export const toggleEventStatus = async (eventId, isActive) => {
  try {
    const response = await axios.patch(`${API_URL}/events/${eventId}/toggle-status`, { isActive });
    return response.data;
  } catch (error) {
    console.error('Error toggling event status:', error);
    throw error;
  }
};

/**
 * Get event details
 * @param {string} eventId - The event's unique ID
 * @returns {Promise<Object>} - Event data
 */
export const getEventRegistrations = async (eventId) => {
  try {
    const response = await axios.get(`${API_URL}/events/${eventId}/registrations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event details:', error);
    throw error;
  }
};

/**
 * Get all event offers
 * @param {Object} params - Query parameters (active, eventId, daily)
 * @returns {Promise<Array>} - List of event offers
 */
export const getAllEventOffers = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/event-offers/`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching event offers:', error);
    throw error;
  }
};

/**
 * Get event offer by ID
 * @param {string} offerId - The offer's unique ID
 * @returns {Promise<Object>} - Event offer data
 */
export const getEventOfferById = async (offerId) => {
  try {
    const response = await axios.get(`${API_URL}/event-offers/${offerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event offer:', error);
    throw error;
  }
};

/**
 * Update an existing event offer
 * @param {string} offerId - The offer's unique ID
 * @param {Object} offerData - Updated offer data
 * @returns {Promise<Object>} - Updated offer data
 */
export const updateEventOffer = async (offerId, offerData) => {
  try {
    const response = await axios.put(`${API_URL}/event-offers/${offerId}`, offerData);
    return response.data;
  } catch (error) {
    console.error('Error updating event offer:', error);
    throw error;
  }
};

/**
 * Delete an event offer
 * @param {string} offerId - The offer's unique ID
 * @returns {Promise<Object>} - Response data
 */
export const deleteEventOffer = async (offerId) => {
  try {
    const response = await axios.delete(`${API_URL}/event-offers/${offerId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting event offer:', error);
    throw error;
  }
};

// ...existing code...

/**
 * Toggle event offer active status
 * @param {string} offerId - The offer's unique ID
 * @returns {Promise<Object>} - Updated offer status
 */
export const toggleEventOfferStatus = async (offerId) => {
  try {
    const response = await axios.patch(`${API_URL}/event-offers/${offerId}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error('Error toggling event offer status:', error);
    throw error;
  }
};

/**
 * Import items from CSV file
 * @param {FormData} formData - FormData containing CSV file and subcategoryId
 * @returns {Promise<Object>} - Import result
 */
export const importItemsFromCSV = async (formData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.post(`${API_URL}/items/import-csv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error importing CSV:', error);
    throw error;
  }
};

// ...existing code...
// ─────────────────────────────
// ALLERGY ROUTES
// ─────────────────────────────

/**
 * Create a new allergy
 * @param {FormData} formData - Form data with name and image
 * @returns {Promise<Object>} - Created allergy data
 */
export const createAllergy = async (formData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.post(`${API_URL}/allergies/`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating allergy:', error);
    throw error;
  }
};

/**
 * Get all allergies
 * @returns {Promise<Array>} - List of all allergies
 */
export const getAllAllergies = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/allergies/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching allergies:', error);
    throw error;
  }
};

/**
 * Get allergy by ID
 * @param {string} id - The allergy's unique ID
 * @returns {Promise<Object>} - Allergy data
 */
export const getAllergyById = async (id) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/allergies/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching allergy:', error);
    throw error;
  }
};

/**
 * Update an existing allergy
 * @param {string} id - The allergy's unique ID
 * @param {FormData} formData - Form data with updated name and/or image
 * @returns {Promise<Object>} - Updated allergy data
 */
export const updateAllergy = async (id, formData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.put(`${API_URL}/allergies/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating allergy:', error);
    throw error;
  }
};

/**
 * Delete an allergy
 * @param {string} id - The allergy's unique ID
 * @returns {Promise<Object>} - Response data
 */
export const deleteAllergy = async (id) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.delete(`${API_URL}/allergies/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting allergy:', error);
    throw error;
  }
};

/**
 * Toggle allergy status
 * @param {string} id - The allergy's unique ID
 * @returns {Promise<Object>} - Updated allergy status
 */
export const toggleAllergyStatus = async (id) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.patch(`${API_URL}/allergies/${id}/toggle-status`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling allergy status:', error);
    throw error;
  }
};
/**
 * Upload an image for an event
 * @param {string} eventId - The ID of the event
 * @param {FormData} formData - The form data containing the image and imageType
 * @returns {Promise<Object>} - The response from the server
 */
export const uploadEventImage = async (eventId, formData) => {
  try {
    const response = await axios.post(`${API_URL}/events/${eventId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload promotional image for an event
 * @param {string} eventId - The ID of the event
 * @param {FormData} formData - The form data containing the promotional image
 * @returns {Promise<Object>} - The response from the server
 */
export const uploadPromotionalImage = async (eventId, formData) => {
  try {
    const response = await axios.post(`${API_URL}/events/${eventId}/upload-promotional-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
/**
 * Upload an image for an event offer
 * @param {string} eventId - The ID of the event
 * @param {string} offerId - The ID of the offer
 * @param {FormData} formData - The form data containing the image
 * @returns {Promise<Object>} - The response from the server
 */
export const uploadOfferImage = async (eventId, offerId, formData) => {
  try {
    const response = await axios.post(`${API_URL}/events/${eventId}/offers/${offerId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload an image for a daily offer
 * @param {string} dailyOfferId - The ID of the daily offer
 * @param {string} offerId - The ID of the offer
 * @param {FormData} formData - The form data containing the image
 * @returns {Promise<Object>} - The response from the server
 */
export const uploadDailyOfferImage = async (dailyOfferId, offerId, formData) => {
  try {
    const response = await axios.post(`${API_URL}/daily-offers/${dailyOfferId}/offers/${offerId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


/**
 * Fetch cafe settings
 * @returns {Promise<Object>} - Cafe settings data
 */
export const fetchCafeSettings = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/settings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching cafe settings:", error);
    throw error;
  }
};

/**
 * Update cafe settings
 * @param {Object} settingsData - Updated cafe settings
 * @returns {Promise<Object>} - Updated cafe settings data
 */
export const updateCafeSettings = async (settingsData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.put(`${API_URL}/settings`, settingsData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating cafe settings:", error);
    throw error;
  }
};

/**
 * Upload cafe image
 * @param {FormData} formData - Form data containing the image
 * @returns {Promise<Object>} - Response with image URL
 */
export const uploadCafeImage = async (formData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.post(`${API_URL}/settings/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading cafe image:", error);
    throw error;
  }
};

/**
 * Fetch all tables
 * @returns {Promise<Array>} - Array of tables
 */
export const fetchTables = async () => {
  try {
    const response = await axios.get(`${API_URL}/tables`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tables:", error);
    throw error;
  }
};

/**
 * Create a new table
 * @param {Object} tableData - Table data
 * @returns {Promise<Object>} - Created table data
 */
export const createTable = async (tableData) => {
  try {
    const response = await axios.post(`${API_URL}/tables`, tableData);
    return response.data;
  } catch (error) {
    console.error("Error creating table:", error);
    throw error;
  }
};

/**
 * Update a table
 * @param {string} tableId - Table ID
 * @param {Object} tableData - Updated table data
 * @returns {Promise<Object>} - Updated table data
 */
export const updateTable = async (tableId, tableData) => {
  try {
    const response = await axios.put(`${API_URL}/tables/${tableId}`, tableData);
    return response.data;
  } catch (error) {
    console.error("Error updating table:", error);
    throw error;
  }
};

/**
 * Delete a table
 * @param {string} tableId - Table ID
 * @returns {Promise<Object>} - Response data
 */
export const deleteTable = async (tableId) => {
  try {
    const response = await axios.delete(`${API_URL}/tables/${tableId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting table:", error);
    throw error;
  }
};

/**
 * Toggle table status
 * @param {string} tableId - Table ID
 * @param {boolean} status - New status
 * @returns {Promise<Object>} - Updated table data
 */
export const toggleTableStatus = async (tableId, status) => {
  try {
    const response = await axios.patch(`${API_URL}/tables/${tableId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Error toggling table status:", error);
    throw error;
  }
};

/**
 * Update tax settings
 * @param {Object} taxData - Tax settings data
 * @returns {Promise<Object>} - Updated tax settings
 */
export const updateTaxSettings = async (taxData) => {
  try {
    const response = await axios.put(`${API_URL}/settings/tax`, taxData);
    return response.data;
  } catch (error) {
    console.error("Error updating tax settings:", error);
    throw error;
  }
};

/**
 * Toggle ordering status
 * @param {boolean} status - New ordering status
 * @returns {Promise<Object>} - Updated settings
 */
export const toggleOrderingStatus = async (status) => {
  try {
    const response = await axios.patch(`${API_URL}/settings/ordering`, { allowOrdering: status });
    return response.data;
  } catch (error) {
    console.error("Error toggling ordering status:", error);
    throw error;
  }
};

/**
 * Update cafe location settings
 * @param {Object} locationData - Location data
 * @returns {Promise<Object>} - Updated location settings
 */
export const updateLocationSettings = async (locationData) => {
  try {
    const response = await axios.put(`${API_URL}/settings/location`, locationData);
    return response.data;
  } catch (error) {
    console.error("Error updating location settings:", error);
    throw error;
  }
};

/**
 * Update menu customization settings
 * @param {Object} customizationData - Menu customization data with cssVariables and logoUrl
 * @returns {Promise<Object>} - Updated menu customization settings
 */
export const updateMenuCustomization = async (customizationData) => {
  try {
    const response = await axios.put(`${API_URL}/settings/menu-customization`, customizationData);
    return response.data;
  } catch (error) {
    console.error("Error updating menu customization:", error);
    throw error;
  }
};

/**
 * Upload menu logo
 * @param {FormData} formData - Form data containing the logo
 * @returns {Promise<Object>} - Response with logo URL
 */
export const uploadMenuLogo = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/settings/upload-menu-logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading menu logo:", error);
    throw error;
  }
};

/**
 * Upload menu background image
 * @param {FormData} formData - Form data containing the background image
 * @returns {Promise<Object>} - Response with background image URL
 */
export const uploadMenuBackgroundImage = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/settings/upload-menu-background`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading menu background image:", error);
    throw error;
  }
};


/**
 * Fetch all daily offers
 * @param {Object} params - Query parameters (active)
 * @returns {Promise<Array>} - Array of daily offers
 */
export const fetchDailyOffers = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/daily-offers`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching daily offers:", error);
    throw error;
  }
};

/**
 * Fetch daily offer by ID
 * @param {string} id - Daily offer ID
 * @returns {Promise<Object>} - Daily offer data
 */
export const fetchDailyOfferById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/daily-offers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching daily offer:", error);
    throw error;
  }
};

/**
 * Create a new daily offer
 * @param {FormData} formData - Form data with daily offer details
 * @returns {Promise<Object>} - Created daily offer
 */
export const createDailyOffer = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/daily-offers`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error creating daily offer:", error);
    throw error;
  }
};

/**
 * Update a daily offer
 * @param {string} id - Daily offer ID
 * @param {FormData} formData - Form data with updated fields
 * @returns {Promise<Object>} - Updated daily offer
 */
export const updateDailyOffer = async (id, formData) => {
  try {
    const response = await axios.put(`${API_URL}/daily-offers/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating daily offer:", error);
    throw error;
  }
};

/**
 * Delete a daily offer
 * @param {string} id - Daily offer ID
 * @returns {Promise<Object>} - Response data
 */
export const deleteDailyOffer = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/daily-offers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting daily offer:", error);
    throw error;
  }
};

/**
 * Toggle daily offer status
 * @param {string} id - Daily offer ID
 * @param {boolean} isActive - New active status
 * @returns {Promise<Object>} - Updated daily offer
 */
export const toggleDailyOfferStatus = async (id, isActive) => {
  try {
    const response = await axios.patch(`${API_URL}/daily-offers/${id}/toggle-status`, { isActive });
    return response.data;
  } catch (error) {
    console.error("Error toggling daily offer status:", error);
    throw error;
  }
};

/**
 * Upload offer image
 * @param {string} dailyOfferId - Daily offer ID
 * @param {string} offerId - Nested offer ID
 * @param {FormData} formData - Form data containing the image
 * @returns {Promise<Object>} - Response with image URL
 */
export const DailyuploadOfferImage = async (dailyOfferId, offerId, formData) => {
  try {
    const response = await axios.post(`${API_URL}/daily-offers/${dailyOfferId}/offers/${offerId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading offer image:", error);
    throw error;
  }
};

/**
 * Upload daily offer background image
 * @param {string} dailyOfferId - Daily offer ID
 * @param {FormData} formData - Form data containing the image
 * @returns {Promise<Object>} - Response with image URL
 */
export const uploadDailyOfferBackgroundImage = async (dailyOfferId, formData) => {
  try {
    const response = await axios.post(`${API_URL}/daily-offers/${dailyOfferId}/upload-background`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading daily offer background image:", error);
    throw error;
  }
};


/**
 * Fetch all food categories
 * @returns {Promise<Array>} - Array of food categories
 */
export const fetchFoodCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/food-categories`);
    return response.data;
  } catch (error) {
    console.error("Error fetching food categories:", error);
    throw error;
  }
};

/**
 * Create a new food category
 * @param {FormData} formData - Form data with name and icon
 * @returns {Promise<Object>} - Created food category
 */
export const createFoodCategory = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/food-categories`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error creating food category:", error);
    throw error;
  }
};

/**
 * Update a food category
 * @param {string} id - Food category ID
 * @param {FormData} formData - Form data with updated fields
 * @returns {Promise<Object>} - Updated food category
 */
export const updateFoodCategory = async (id, formData) => {
  try {
    const response = await axios.put(`${API_URL}/food-categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating food category:", error);
    throw error;
  }
};

/**
 * Delete a food category
 * @param {string} id - Food category ID
 * @returns {Promise<Object>} - Response data
 */
export const deleteFoodCategory = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/food-categories/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting food category:", error);
    throw error;
  }
};

/**
 * Toggle food category status
 * @param {string} id - Food category ID
 * @returns {Promise<Object>} - Updated food category
 */
export const toggleFoodCategoryStatus = async (id) => {
  try {
    const response = await axios.patch(`${API_URL}/food-categories/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error("Error toggling food category status:", error);
    throw error;
  }
};


/**
 * Fetch all tags
 * @returns {Promise<Array>} - Array of tags
 */
export const fetchTags = async () => {
  try {
    const response = await axios.get(`${API_URL}/tags`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
};

/**
 * Create a new tag
 * @param {Object} tagData - Tag data with name and color
 * @returns {Promise<Object>} - Created tag
 */
export const createTag = async (tagData) => {
  try {
    const response = await axios.post(`${API_URL}/tags`, tagData);
    return response.data;
  } catch (error) {
    console.error("Error creating tag:", error);
    throw error;
  }
};

/**
 * Update a tag
 * @param {string} id - Tag ID
 * @param {Object} tagData - Updated tag data
 * @returns {Promise<Object>} - Updated tag
 */
export const updateTag = async (id, tagData) => {
  try {
    const response = await axios.put(`${API_URL}/tags/${id}`, tagData);
    return response.data;
  } catch (error) {
    console.error("Error updating tag:", error);
    throw error;
  }
};

/**
 * Delete a tag
 * @param {string} id - Tag ID
 * @returns {Promise<Object>} - Response data
 */
export const deleteTag = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/tags/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting tag:", error);
    throw error;
  }
};

/**
 * Toggle tag status
 * @param {string} id - Tag ID
 * @returns {Promise<Object>} - Updated tag
 */
export const toggleTagStatus = async (id) => {
  try {
    const response = await axios.patch(`${API_URL}/tags/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error("Error toggling tag status:", error);
    throw error;
  }
};


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


// ─────────────────────────────
// FEEDBACK ROUTES
// ─────────────────────────────

/**
 * Get all feedback (admin)
 * @returns {Promise<Array>} - List of all feedback
 */
export const getAllFeedback = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/feedback`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }
};

/**
 * Get feedback by ID (admin)
 * @param {string} id - Feedback ID
 * @returns {Promise<Object>} - Feedback data
 */
export const getFeedbackById = async (id) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/feedback/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }
};

/**
 * Delete feedback (admin)
 * @param {string} id - Feedback ID
 * @returns {Promise<Object>} - Response data
 */
export const deleteFeedback = async (id) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.delete(`${API_URL}/feedback/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw error;
  }
};

// ─────────────────────────────
// CUSTOM MESSAGES ROUTES
// ─────────────────────────────

/**
 * Get all custom messages
 * @returns {Promise<Object>} - Custom messages data
 */
export const getMessages = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/messages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Update custom messages
 * @param {Object} messageData - Message data to update
 * @returns {Promise<Object>} - Updated messages data
 */
export const updateMessages = async (messageData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.put(`${API_URL}/messages`, messageData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating messages:', error);
    throw error;
  }
};

// Default export moved to end of file

// ─────────────────────────────
// ADDITIONAL CUSTOM MESSAGE ROUTES
// ─────────────────────────────

/**
 * Get all custom messages (alternative endpoint)
 * @returns {Promise<Array>} - List of custom messages
 */
export const getAllCustomMessages = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/custom-messages/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching custom messages:', error);
    throw error;
  }
};

/**
 * Get custom message by ID
 * @param {string} messageId - The message's unique ID
 * @returns {Promise<Object>} - Custom message data
 */
export const getCustomMessageById = async (messageId) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/custom-messages/${messageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching custom message:', error);
    throw error;
  }
};

/**
 * Create a new custom message
 * @param {Object} messageData - Message data
 * @returns {Promise<Object>} - Created message data
 */
export const createCustomMessage = async (messageData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.post(`${API_URL}/custom-messages/`, messageData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating custom message:', error);
    throw error;
  }
};

/**
 * Update an existing custom message
 * @param {string} messageId - The message's unique ID
 * @param {Object} messageData - Updated message data
 * @returns {Promise<Object>} - Updated message data
 */
export const updateCustomMessage = async (messageId, messageData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.put(`${API_URL}/custom-messages/${messageId}`, messageData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating custom message:', error);
    throw error;
  }
};

/**
 * Delete a custom message
 * @param {string} messageId - The message's unique ID
 * @returns {Promise<Object>} - Response data
 */
export const deleteCustomMessage = async (messageId) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.delete(`${API_URL}/custom-messages/${messageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting custom message:', error);
    throw error;
  }
};

/**
 * Toggle custom message active status
 * @param {string} messageId - The message's unique ID
 * @param {boolean} isActive - The new active status
 * @returns {Promise<Object>} - Updated message status
 */
export const toggleCustomMessageStatus = async (messageId, isActive) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.patch(`${API_URL}/custom-messages/${messageId}/toggle-status`, { isActive }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling custom message status:', error);
    throw error;
  }
};


export const fetchAllVariations = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/variations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch variations:', error);
    throw error;
  }
};

export const createVariation = async (variationData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.post(`${API_URL}/variations`, variationData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create variation:', error);
    throw error;
  }
};

export const updateVariation = async (id, variationData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.put(`${API_URL}/variations/${id}`, variationData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update variation:', error);
    throw error;
  }
};

export const deleteVariation = async (id) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.delete(`${API_URL}/variations/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to delete variation:', error);
    throw error;
  }
};

export const toggleVariationStatus = async (id, isActive) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.patch(`${API_URL}/variations/${id}/toggle-status`, { isActive }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to toggle variation status:', error);
    throw error;
  }
};

// ─────────────────────────────
// USER INFO COLLECTION ROUTES
// ─────────────────────────────

/**
 * Get all user info submissions
 * @returns {Promise<Array>} - List of user info submissions
 */
export const getUserInfoList = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/user-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // For debugging
    console.log('Raw API response:', response);
    
    // If the data is directly in the response (not in a data property)
    if (response && !response.data && Array.isArray(response)) {
      return response;
    }
    
    // Return the data as is
    return response.data;
  } catch (error) {
    console.error('Error fetching user info list:', error);
    throw error;
  }
};

/**
 * Get user info collection settings
 * @returns {Promise<Object>} - User info settings
 */
export const getUserInfoSettings = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/user-info/settings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user info settings:', error);
    throw error;
  }
};

/**
 * Update user info collection settings
 * @param {Object} settings - Settings object with enabled property
 * @returns {Promise<Object>} - Updated settings
 */
export const updateUserInfoSettings = async (settings) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.put(`${API_URL}/user-info/settings`, settings, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user info settings:', error);
    throw error;
  }
};

// Default export with all necessary functions
// ─────────────────────────────
// IMAGE UPLOAD ROUTES
// ─────────────────────────────

/**
 * Get all image uploads
 * @returns {Promise<Array>} - List of image uploads
 */
export const getImageUploads = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/image-uploads`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching image uploads:', error);
    throw error;
  }
};

/**
 * Create a new image upload
 * @param {FormData} formData - Form data with message and image
 * @returns {Promise<Object>} - Created image upload
 */
export const createImageUpload = async (formData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.post(`${API_URL}/image-uploads`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating image upload:', error);
    throw error;
  }
};

/**
 * Delete an image upload
 * @param {string} id - Image upload ID
 * @returns {Promise<Object>} - Response data
 */
export const deleteImageUpload = async (id) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.delete(`${API_URL}/image-uploads/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting image upload:', error);
    throw error;
  }
};

/**
 * Toggle image upload visibility
 * @param {string} id - Image upload ID
 * @returns {Promise<Object>} - Updated image upload
 */
export const toggleImageUploadVisibility = async (id) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.patch(`${API_URL}/image-uploads/${id}/toggle-visibility`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling image upload visibility:', error);
    throw error;
  }
};

export default {
  getAllFeedback,
  getFeedbackById,
  deleteFeedback,
  getUserInfoList,
  getUserInfoSettings,
  updateUserInfoSettings,
  getImageUploads,
  createImageUpload,
  deleteImageUpload,
  toggleImageUploadVisibility
};