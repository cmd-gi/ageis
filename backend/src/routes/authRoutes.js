/**
 * Authentication Routes
 * Routes for user authentication and profile management
 * All routes prefixed with /api
 */

import express from 'express';
import {
  signup,
  login,
  getProfile,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  signupValidation,
  loginValidation,
  updateProfileValidation,
  validate,
} from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /api/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', signupValidation, validate, signup);

/**
 * @route   POST /api/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post('/login', loginValidation, validate, login);

/**
 * @route   GET /api/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', protect, getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, updateProfileValidation, validate, updateProfile);

export default router;
