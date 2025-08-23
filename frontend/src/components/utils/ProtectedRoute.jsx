/**
 * @fileoverview Protected Route Component for TopchiOutpost Admin Access
 * 
 * This component provides route-level authentication protection for admin pages.
 * It checks for valid authentication tokens and redirects unauthorized users
 * to the login page. This is a higher-order component that wraps admin routes.
 * 
 * @author TopchiOutpost Development Team
 * @version 1.0.0
 * @since 2025-01-01
 * 
 * @requires react-router-dom - For navigation and route protection
 */

import { Navigate } from 'react-router-dom';
import { isTokenValid } from '../../utils/tokenManager';

/**
 * Protected Route Component
 * @description Wrapper component that enforces authentication for admin routes
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to render if authenticated
 * @returns {JSX.Element} Either the protected content or a redirect to login
 * 
 * @example
 * <ProtectedRoute>
 *   <AdminDashboard />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ children }) => {
  /**
   * Check for authentication token in cookies
   * @description Uses cookie-based token validation for better security
   */
  const isAuthenticated = isTokenValid();
  
  /**
   * Conditional rendering based on authentication status
   * @returns {JSX.Element} Protected content if authenticated, otherwise redirect to login
   */
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;