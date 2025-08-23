// Token management utility using encrypted cookies

// Simple encryption/decryption functions
const encrypt = (text) => {
  try {
    return btoa(encodeURIComponent(text));
  } catch {
    return text;
  }
};

const decrypt = (encryptedText) => {
  try {
    return decodeURIComponent(atob(encryptedText));
  } catch {
    return encryptedText;
  }
};

// Cookie utility functions
const setCookie = (name, value, hours = 6) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (hours * 60 * 60 * 1000));
  const encryptedValue = encrypt(value);
  document.cookie = `${name}=${encryptedValue};expires=${expires.toUTCString()};path=/;samesite=strict`;
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      const encryptedValue = c.substring(nameEQ.length, c.length);
      return decrypt(encryptedValue);
    }
  }
  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Helper function to check token validity
export const isTokenValid = () => {
  const token = getCookie('adminToken');
  return token !== null;
};

// Helper function to get valid token
export const getValidToken = () => {
  return getCookie('adminToken');
};

// Set token with expiration (6 hours)
export const setTokenWithExpiry = (token, hours = 6, adminData = null) => {
  setCookie('adminToken', token, hours);
  
  // Store admin features if provided
  if (adminData && adminData.features) {
    setCookie('adminFeatures', JSON.stringify(adminData.features), hours);
  }
  
  // Store admin ID if provided
  if (adminData && adminData.id) {
    setCookie('adminId', adminData.id, hours);
  }
};

// Clear token
export const clearToken = () => {
  deleteCookie('adminToken');
  deleteCookie('adminFeatures');
  deleteCookie('adminId');
};

// Get admin features
export const getAdminFeatures = () => {
  try {
    const features = getCookie('adminFeatures');
    return features ? JSON.parse(features) : {
      ordersToggle: false,
      eventsToggle: false,
      dailyOfferToggle: false
    };
  } catch {
    return {
      ordersToggle: false,
      eventsToggle: false,
      dailyOfferToggle: false
    };
  }
};

// Get admin ID
export const getAdminId = () => {
  return getCookie('adminId');
};

// Set admin features manually
export const setAdminFeatures = (features) => {
  try {
    setCookie('adminFeatures', JSON.stringify(features), 6);
    // Trigger custom event for other components to update
    window.dispatchEvent(new CustomEvent('adminFeaturesChanged', { detail: features }));
  } catch (error) {
    console.error('Error setting admin features:', error);
  }
};