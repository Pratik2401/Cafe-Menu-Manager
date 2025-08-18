/**
 * @fileoverview Admin Authentication Middleware for TopchiOutpost Cafe Management System
 * 
 * This middleware provides JWT-based authentication for admin routes. It validates
 * JWT tokens, extracts admin information, and ensures secure access to admin endpoints.
 * The middleware follows industry-standard security practices for token validation.
 * 
 * @author TopchiOutpost Development Team
 * @version 1.0.0
 * @since 2025-01-01
 * 
 * @requires jsonwebtoken - JWT token handling
 */

const jwt = require('jsonwebtoken');

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Ensure JWT_SECRET is configured
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables.");
}

/**
 * Admin authentication middleware
 * @description Validates JWT tokens for admin access and attaches admin ID to request
 * @middleware
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Authorization header with Bearer token
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Usage in routes:
 * router.get('/protected-route', adminAuth, controllerFunction);
 * 
 * // Expected header format:
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
const adminAuth = (req, res, next) => {
  // Extract token from Authorization header (Bearer <token>)
  const token = req.headers.authorization?.split(' ')[1];
  
  // Debug logging for token validation (remove in production)
  console.log('Auth header:', req.headers.authorization);
  console.log('Extracted token:', token);
  console.log('JWT_SECRET exists:', !!JWT_SECRET);

  // Check if token is provided
  if (!token) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return; // Exit the function after sending the response
  }

  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Attach admin ID to request body for use in controllers
    req.body.adminId = decoded.id;
    
    // Continue to next middleware/controller
    next();
  } catch (err) {
    // Handle token verification errors
    console.log('Token verification error:', err.message);
    res.status(403).json({ message: 'Invalid or expired token.' });
    return; // Exit the function after sending the response
  }
};

module.exports = { adminAuth };