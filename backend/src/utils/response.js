/**
 * Response Utilities
 * Standard response formatting for API endpoints
 */

import { STATUS_CODES } from '../config/constants.js';

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {Object} data - Response data
 * @param {string} message - Optional success message
 */
export const sendSuccess = (res, statusCode = STATUS_CODES.OK, data = {}, message = '') => {
  const response = {
    success: true,
    ...data,
  };

  if (message) {
    response.message = message;
  }

  res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 */
export const sendError = (res, statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR, message = 'An error occurred') => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 */
export const sendPaginatedResponse = (res, data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.status(STATUS_CODES.OK).json({
    success: true,
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
    },
  });
};
