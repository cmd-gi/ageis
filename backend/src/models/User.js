/**
 * User Model
 * Defines the User schema with authentication fields
 * Includes methods for password comparison
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { VALIDATION_RULES } from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [VALIDATION_RULES.USERNAME_MIN_LENGTH, `Username must be at least ${VALIDATION_RULES.USERNAME_MIN_LENGTH} characters`],
      maxlength: [VALIDATION_RULES.USERNAME_MAX_LENGTH, `Username cannot exceed ${VALIDATION_RULES.USERNAME_MAX_LENGTH} characters`],
      match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [VALIDATION_RULES.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`],
      select: false, // Don't include password in queries by default
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    toJSON: {
      // Transform output when converting to JSON
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

/**
 * Pre-save middleware to hash password before saving
 * Only runs when password is modified
 */
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to compare entered password with hashed password
 * @param {string} enteredPassword - Plain text password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Method to get public user data (without sensitive info)
 * @returns {Object} - User object without password
 */
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model('User', userSchema);

export default User;
