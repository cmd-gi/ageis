/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 * Attaches user information to request object
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { STATUS_CODES, ERROR_MESSAGES } from '../config/constants.js';

/**
 * Middleware to verify JWT token and authenticate user
 * Usage: Add this middleware to any route that requires authentication
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header
      // Format: "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password field)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: ERROR_MESSAGES.USER_NOT_FOUND,
        });
      }

      // Continue to next middleware/route handler
      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      
      // Handle specific JWT errors
      let message = ERROR_MESSAGES.INVALID_TOKEN;
      
      if (error.name === 'TokenExpiredError') {
        message = 'Token has expired';
      } else if (error.name === 'JsonWebTokenError') {
        message = 'Invalid token';
      }

      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message,
      });
    }
  } else {
    // No token provided
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED,
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't block the request
 * Useful for routes that can work with or without authentication
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Silently fail - user will be undefined
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
};
