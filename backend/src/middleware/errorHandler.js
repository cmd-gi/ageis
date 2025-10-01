/**
 * Error Handling Middleware
 * Central error handling for the application
 * Formats errors consistently for frontend consumption
 */

import { STATUS_CODES, ERROR_MESSAGES } from '../config/constants.js';

/**
 * Handle Mongoose validation errors
 * @param {Object} err - Mongoose validation error
 * @returns {Object} - Formatted error response
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((error) => error.message);
  return {
    success: false,
    message: errors.join(', '),
    statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
  };
};

/**
 * Handle Mongoose duplicate key errors
 * @param {Object} err - Mongoose duplicate key error
 * @returns {Object} - Formatted error response
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyPattern)[0];
  const value = err.keyValue[field];
  return {
    success: false,
    message: `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`,
    statusCode: STATUS_CODES.CONFLICT,
  };
};

/**
 * Handle Mongoose cast errors (invalid ObjectId)
 * @param {Object} err - Mongoose cast error
 * @returns {Object} - Formatted error response
 */
const handleCastError = (err) => {
  return {
    success: false,
    message: `Invalid ${err.path}: ${err.value}`,
    statusCode: STATUS_CODES.BAD_REQUEST,
  };
};

/**
 * Error handling middleware
 * Catches all errors and sends formatted response
 * 
 * @param {Object} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  let error = { ...err };
  error.message = err.message;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const formatted = handleValidationError(err);
    return res.status(formatted.statusCode).json({
      success: false,
      message: formatted.message,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const formatted = handleDuplicateKeyError(err);
    return res.status(formatted.statusCode).json({
      success: false,
      message: formatted.message,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    const formatted = handleCastError(err);
    return res.status(formatted.statusCode).json({
      success: false,
      message: formatted.message,
    });
  }

  // Default error response
  res.status(err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message || ERROR_MESSAGES.SERVER_ERROR,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Handle 404 Not Found errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const notFound = (req, res) => {
  res.status(STATUS_CODES.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};
