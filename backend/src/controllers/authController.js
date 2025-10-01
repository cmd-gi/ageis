/**
 * Authentication Controller
 * Handles user signup, login, and profile operations
 */

import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { STATUS_CODES, ERROR_MESSAGES } from '../config/constants.js';

/**
 * @route   POST /api/signup
 * @desc    Register a new user
 * @access  Public
 * 
 * Expected request body:
 * {
 *   "email": "user@example.com",
 *   "username": "johndoe",
 *   "password": "securepassword123"
 * }
 * 
 * Response format (matches frontend expectations):
 * {
 *   "success": true,
 *   "token": "jwt_token_here",
 *   "user": {
 *     "id": "user_id",
 *     "email": "user@example.com",
 *     "username": "johndoe"
 *   }
 * }
 */
export const signup = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username: username.toLowerCase() }],
    });

    if (existingUser) {
      return sendError(
        res,
        STATUS_CODES.CONFLICT,
        existingUser.email === email
          ? 'Email already registered'
          : 'Username already taken'
      );
    }

    // Create new user
    const user = await User.create({
      email,
      username: username.toLowerCase(),
      password, // Will be hashed by pre-save middleware
    });

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response matching frontend expectations
    sendSuccess(res, STATUS_CODES.CREATED, {
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/login
 * @desc    Authenticate user and return token
 * @access  Public
 * 
 * Expected request body:
 * {
 *   "emailOrUsername": "user@example.com or johndoe",
 *   "password": "securepassword123"
 * }
 * 
 * Response format (matches frontend expectations):
 * {
 *   "success": true,
 *   "token": "jwt_token_here",
 *   "user": {
 *     "id": "user_id",
 *     "email": "user@example.com",
 *     "username": "johndoe"
 *   }
 * }
 */
export const login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Find user by email or username (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() },
      ],
    }).select('+password'); // Include password field for comparison

    // Check if user exists
    if (!user) {
      return sendError(
        res,
        STATUS_CODES.UNAUTHORIZED,
        ERROR_MESSAGES.INVALID_CREDENTIALS
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return sendError(
        res,
        STATUS_CODES.UNAUTHORIZED,
        ERROR_MESSAGES.INVALID_CREDENTIALS
      );
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response matching frontend expectations
    sendSuccess(res, STATUS_CODES.OK, {
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/profile
 * @desc    Get current user profile
 * @access  Private (requires JWT token)
 * 
 * Response format:
 * {
 *   "success": true,
 *   "id": "user_id",
 *   "email": "user@example.com",
 *   "username": "johndoe",
 *   "createdAt": "2024-01-01T00:00:00.000Z",
 *   "updatedAt": "2024-01-01T00:00:00.000Z"
 * }
 */
export const getProfile = async (req, res, next) => {
  try {
    // User is attached to req by auth middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(
        res,
        STATUS_CODES.NOT_FOUND,
        ERROR_MESSAGES.USER_NOT_FOUND
      );
    }

    // Send user data directly (matching frontend expectations)
    sendSuccess(res, STATUS_CODES.OK, user.toPublicJSON());
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/profile
 * @desc    Update user profile (username, email, password)
 * @access  Private (requires JWT token)
 * 
 * Expected request body (all fields optional):
 * {
 *   "username": "newusername",
 *   "email": "newemail@example.com",
 *   "password": "newpassword123"
 * }
 * 
 * Response format:
 * {
 *   "success": true,
 *   "id": "user_id",
 *   "email": "newemail@example.com",
 *   "username": "newusername",
 *   "createdAt": "2024-01-01T00:00:00.000Z",
 *   "updatedAt": "2024-01-01T00:00:00.000Z"
 * }
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Get current user
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(
        res,
        STATUS_CODES.NOT_FOUND,
        ERROR_MESSAGES.USER_NOT_FOUND
      );
    }

    // Check if new username or email is already taken by another user
    if (username || email) {
      const query = {};
      if (username) query.username = username.toLowerCase();
      if (email) query.email = email.toLowerCase();

      const existingUser = await User.findOne({
        ...query,
        _id: { $ne: user._id }, // Exclude current user
      });

      if (existingUser) {
        return sendError(
          res,
          STATUS_CODES.CONFLICT,
          existingUser.username === username?.toLowerCase()
            ? 'Username already taken'
            : 'Email already registered'
        );
      }
    }

    // Update fields if provided
    if (username) user.username = username.toLowerCase();
    if (email) user.email = email.toLowerCase();
    if (password) user.password = password; // Will be hashed by pre-save middleware

    // Save updated user
    await user.save();

    // Send updated user data
    sendSuccess(res, STATUS_CODES.OK, user.toPublicJSON());
  } catch (error) {
    next(error);
  }
};
