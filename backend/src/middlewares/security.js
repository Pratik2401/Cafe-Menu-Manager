/**
 * @fileoverview Security and Rate Limiting Middleware for TopchiOutpost Cafe Management System
 * 
 * This module provides comprehensive security middleware including rate limiting,
 * request size limits, and security headers for production deployment.
 * 
 * @author TopchiOutpost Development Team
 * @version 1.0.0
 * @since 2025-01-01
 */

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');

/**
 * General API rate limiting
 * @description Limits requests to prevent abuse and ensure fair usage
 */
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // More lenient in development
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(15 * 60 / 60) + ' minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    console.warn(`🚫 Rate limit exceeded for IP: ${req.ip} on ${req.path} - Total requests in window exceeded ${process.env.NODE_ENV === 'development' ? 1000 : 100}`);
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(15 * 60 / 60) + ' minutes'
    });
  },
});

/**
 * Strict rate limiting for authentication endpoints
 * @description More restrictive limits for login/register endpoints
 */
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: Math.ceil(15 * 60 / 60) + ' minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    console.warn(`🚫 Auth rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: Math.ceil(15 * 60 / 60) + ' minutes'
    });
  },
});

/**
 * Upload rate limiting
 * @description Rate limiting for file upload endpoints
 */
const uploadRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // limit each IP to 20 uploads per windowMs
  message: {
    error: 'Too many upload requests, please try again later.',
    retryAfter: Math.ceil(10 * 60 / 60) + ' minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`🚫 Upload rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      error: 'Too many upload requests, please try again later.',
      retryAfter: Math.ceil(10 * 60 / 60) + ' minutes'
    });
  },
});

/**
 * Slow down middleware for gradual response delay
 * @description Gradually increases response time for repeat requests
 */
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per windowMs without delay
  delayMs: () => 100, // add 100ms of delay per request after delayAfter (new v2+ syntax)
  maxDelayMs: 5000, // maximum delay of 5 seconds
  validate: { delayMs: false }, // disable warning about delayMs behavior change
});

/**
 * Security headers configuration
 * @description Helmet configuration for production security
 */
const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.imagekit.io"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  
  // Cross Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Disable for now as it may break image uploads
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // X-Frame-Options
  frameguard: {
    action: 'deny'
  },
  
  // X-Content-Type-Options
  noSniff: true,
  
  // Referrer Policy
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin"
  },
  
  // X-XSS-Protection (deprecated but still used by some browsers)
  xssFilter: true,
});

/**
 * Request size limiting middleware
 * @description Configures JSON and URL-encoded payload size limits
 */
const requestSizeLimits = {
  // JSON payload limit (for regular API requests)
  json: { limit: '10mb' },
  
  // URL-encoded payload limit (for form submissions)  
  urlencoded: { extended: true, limit: '10mb' },
  
  // Raw payload limit (for file uploads)
  raw: { limit: '50mb' },
  
  // Text payload limit
  text: { limit: '1mb' },
};

/**
 * API-specific middleware combinations
 * @description Pre-configured middleware stacks for different API patterns
 */
const middlewareStacks = {
  // Standard API endpoints - Development mode (higher limits)
  api: [
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000, // Much higher limit for development
      standardHeaders: true,
      legacyHeaders: false,
    })
  ],
  
  // Authentication endpoints - Development mode
  auth: [
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100, // Higher limit for development
      standardHeaders: true,
      legacyHeaders: false,
    })
  ],
  
  // File upload endpoints - Development mode
  upload: [
    rateLimit({
      windowMs: 10 * 60 * 1000,
      max: 100, // Much higher limit for development
      standardHeaders: true,
      legacyHeaders: false,
    })
  ],
  
  // Public customer endpoints (more lenient)
  customer: [
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500, // Higher limit for customer endpoints
      standardHeaders: true,
      legacyHeaders: false,
    })
  ],
  
  // Admin endpoints - Development mode (much higher limits)
  admin: [
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500, // Much higher limit for development
      standardHeaders: true,
      legacyHeaders: false,
    })
  ],
};

/**
 * Logging middleware for security events
 * @description Logs security-related events for monitoring
 */
const securityLogger = (req, res, next) => {
  // Log suspicious requests
  const userAgent = req.get('User-Agent') || 'Unknown';
  const suspicious = [
    'sqlmap', 'nikto', 'nmap', 'masscan', 'zap', 'burp',
    'acunetix', 'netsparker', 'appscan', 'w3af'
  ];
  
  if (suspicious.some(tool => userAgent.toLowerCase().includes(tool))) {
    console.warn(`🚨 Suspicious request detected from ${req.ip}: ${userAgent}`);
  }
  
  // Log failed authentication attempts
  if (req.path.includes('/auth/') && req.method === 'POST') {
    res.on('finish', () => {
      if (res.statusCode === 401 || res.statusCode === 403) {
        console.warn(`🔐 Failed auth attempt from ${req.ip} to ${req.path}`);
      }
    });
  }
  
  next();
};

/**
 * IP whitelist middleware for admin endpoints
 * @description Optional IP restriction for admin access
 */
const ipWhitelist = (req, res, next) => {
  const whitelist = process.env.ADMIN_IP_WHITELIST;
  
  if (!whitelist) {
    return next(); // Skip if no whitelist configured
  }
  
  const allowedIPs = whitelist.split(',').map(ip => ip.trim());
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (!allowedIPs.includes(clientIP)) {
    console.warn(`🚫 Blocked admin access from non-whitelisted IP: ${clientIP}`);
    return res.status(403).json({
      error: 'Access denied: IP not whitelisted for admin access'
    });
  }
  
  next();
};

module.exports = {
  // Rate limiters
  generalRateLimit,
  authRateLimit,
  uploadRateLimit,
  speedLimiter,
  
  // Security
  securityHeaders,
  securityLogger,
  ipWhitelist,
  
  // Request limits
  requestSizeLimits,
  
  // Middleware stacks
  middlewareStacks,
};
