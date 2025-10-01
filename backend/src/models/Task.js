/**
 * Task Model
 * Defines the Task schema for CRUD operations
 * Each task is associated with a user (userId)
 */

import mongoose from 'mongoose';
import { TASK_STATUS } from '../config/constants.js';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TASK_STATUS),
        message: `Status must be one of: ${Object.values(TASK_STATUS).join(', ')}`,
      },
      default: TASK_STATUS.TODO,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Index for faster queries by userId
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
        return ret;
      },
    },
  }
);

// Compound index for efficient querying by user and status
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

// Text index for search functionality
taskSchema.index({ title: 'text', description: 'text' });

/**
 * Static method to find tasks by user with optional filters
 * @param {string} userId - The user ID
 * @param {Object} filters - Optional filters (status, search)
 * @param {Object} options - Optional pagination options
 * @returns {Promise<Array>} - Array of tasks
 */
taskSchema.statics.findByUser = function (userId, filters = {}, options = {}) {
  const query = { userId };

  // Apply status filter if provided
  if (filters.status) {
    query.status = filters.status;
  }

  // Apply text search if provided
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  // Build the query
  let taskQuery = this.find(query);

  // Apply sorting (default: newest first)
  const sortBy = options.sortBy || '-createdAt';
  taskQuery = taskQuery.sort(sortBy);

  // Apply pagination if provided
  if (options.page && options.limit) {
    const skip = (options.page - 1) * options.limit;
    taskQuery = taskQuery.skip(skip).limit(options.limit);
  }

  return taskQuery;
};

/**
 * Static method to count tasks by user
 * @param {string} userId - The user ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<number>} - Count of tasks
 */
taskSchema.statics.countByUser = function (userId, filters = {}) {
  const query = { userId };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  return this.countDocuments(query);
};

const Task = mongoose.model('Task', taskSchema);

export default Task;
