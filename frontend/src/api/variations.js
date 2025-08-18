import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL_ADMIN || "https://topchioutpost.snap2eat.in/api/admin";

export const fetchAllVariations = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/variations/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching variations:', error);
    throw error;
  }
};

export const createVariation = async (variationData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.post(`${API_URL}/variations/`, variationData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating variation:', error);
    throw error;
  }
};

export const updateVariation = async (id, variationData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.put(`${API_URL}/variations/${id}`, variationData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating variation:', error);
    throw error;
  }
};

export const deleteVariation = async (id) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.delete(`${API_URL}/variations/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting variation:', error);
    throw error;
  }
};

export const toggleVariationStatus = async (id) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.patch(`${API_URL}/variations/${id}/toggle-status`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling variation status:', error);
    throw error;
  }
};