/**
 * Validation Middleware
 * Input validation for various endpoints using express-validator
 */

import { body, param, query, validationResult } from 'express-validator';
import { STATUS_CODES, TASK_STATUS, VALIDATION_RULES } from '../config/constants.js';

/**
 * Middleware to check validation results
 * Returns errors if validation fails
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(STATUS_CODES.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: errorMessages.join(', '),
      errors: errors.array(),
    });
  }
  
  next();
};

/**
 * Validation rules for user signup
 */
export const signupValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('username')
    .trim()
    .isLength({ min: VALIDATION_RULES.USERNAME_MIN_LENGTH, max: VALIDATION_RULES.USERNAME_MAX_LENGTH })
    .withMessage(`Username must be between ${VALIDATION_RULES.USERNAME_MIN_LENGTH} and ${VALIDATION_RULES.USERNAME_MAX_LENGTH} characters`)
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('password')
    .isLength({ min: VALIDATION_RULES.PASSWORD_MIN_LENGTH })
    .withMessage(`Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`)
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

/**
 * Validation rules for user login
 */
export const loginValidation = [
  body('emailOrUsername')
    .trim()
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Validation rules for profile update
 */
export const updateProfileValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: VALIDATION_RULES.USERNAME_MIN_LENGTH, max: VALIDATION_RULES.USERNAME_MAX_LENGTH })
    .withMessage(`Username must be between ${VALIDATION_RULES.USERNAME_MIN_LENGTH} and ${VALIDATION_RULES.USERNAME_MAX_LENGTH} characters`)
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .optional()
    .isLength({ min: VALIDATION_RULES.PASSWORD_MIN_LENGTH })
    .withMessage(`Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`),
];

/**
 * Validation rules for creating a task
 */
export const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(Object.values(TASK_STATUS))
    .withMessage(`Status must be one of: ${Object.values(TASK_STATUS).join(', ')}`),
];

/**
 * Validation rules for updating a task
 */
export const updateTaskValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(Object.values(TASK_STATUS))
    .withMessage(`Status must be one of: ${Object.values(TASK_STATUS).join(', ')}`),
];

/**
 * Validation rules for task ID parameter
 */
export const taskIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID'),
];

/**
 * Validation rules for task query parameters
 */
export const taskQueryValidation = [
  query('status')
    .optional()
    .isIn(Object.values(TASK_STATUS))
    .withMessage(`Status must be one of: ${Object.values(TASK_STATUS).join(', ')}`),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];
