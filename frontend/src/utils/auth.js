// Authentication utilities
export const isAuthenticated = () => {
  const token = localStorage.getItem('adminToken');
  return !!token;
};

export const getAuthToken = () => {
  return localStorage.getItem('adminToken');
};

export const logout = () => {
  localStorage.removeItem('adminToken');
  window.location.href = '/admin/login';
};