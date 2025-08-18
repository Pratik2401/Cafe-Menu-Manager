// Token management utility

// Helper function to check token validity
export const isTokenValid = () => {
  const tokenData = localStorage.getItem('adminTokenData');
  if (!tokenData) return false;
  
  try {
    const { expiry } = JSON.parse(tokenData);
    return Date.now() < expiry;
  } catch {
    return false;
  }
};

// Helper function to get valid token
export const getValidToken = () => {
  if (isTokenValid()) {
    return localStorage.getItem('adminToken');
  }
  // Token expired, clear storage
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminTokenData');
  return null;
};

// Set token with expiration
export const setTokenWithExpiry = (token, hours = 4) => {
  const tokenData = {
    token: token,
    expiry: Date.now() + (hours * 60 * 60 * 1000)
  };
  localStorage.setItem('adminToken', token);
  localStorage.setItem('adminTokenData', JSON.stringify(tokenData));
};

// Clear token
export const clearToken = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminTokenData');
};