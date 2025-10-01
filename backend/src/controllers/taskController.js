/**
 * Task Controller
 * Handles CRUD operations for tasks
 * All operations are user-scoped (users can only access their own tasks)
 */

import Task from '../models/Task.js';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response.js';
import { STATUS_CODES, ERROR_MESSAGES } from '../config/constants.js';

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for authenticated user
 * @access  Private
 * 
 * Query parameters:
 * - status: Filter by task status (todo, in-progress, completed)
 * - search: Search in title and description
 * - page: Page number for pagination (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * 
 * Response format:
 * Without pagination:
 * [
 *   {
 *     "id": "task_id",
 *     "title": "Task title",
 *     "description": "Task description",
 *     "status": "todo",
 *     "createdAt": "2024-01-01T00:00:00.000Z",
 *     "updatedAt": "2024-01-01T00:00:00.000Z"
 *   }
 * ]
 * 
 * With pagination:
 * {
 *   "success": true,
 *   "data": [...],
 *   "pagination": {
 *     "currentPage": 1,
 *     "totalPages": 5,
 *     "totalItems": 50,
 *     "itemsPerPage": 10,
 *     "hasNextPage": true,
 *     "hasPrevPage": false
 *   }
 * }
 */
export const getTasks = async (req, res, next) => {
  try {
    const { status, search, page, limit } = req.query;

    // Build filters
    const filters = {};
    if (status) filters.status = status;
    if (search) filters.search = search;

    // Check if pagination is requested
    const usePagination = page && limit;

    if (usePagination) {
      // Get paginated tasks
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      const tasks = await Task.findByUser(req.user.id, filters, {
        page: pageNum,
        limit: limitNum,
      });

      // Get total count for pagination
      const total = await Task.countByUser(req.user.id, filters);

      sendPaginatedResponse(res, tasks, pageNum, limitNum, total);
    } else {
      // Get all tasks without pagination
      const tasks = await Task.findByUser(req.user.id, filters);

      // Send as array (matching frontend expectations from api.ts)
      res.status(STATUS_CODES.OK).json(tasks);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID
 * @access  Private
 * 
 * Response format:
 * {
 *   "id": "task_id",
 *   "title": "Task title",
 *   "description": "Task description",
 *   "status": "todo",
 *   "createdAt": "2024-01-01T00:00:00.000Z",
 *   "updatedAt": "2024-01-01T00:00:00.000Z"
 * }
 */
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id, // Ensure user owns this task
    });

    if (!task) {
      return sendError(
        res,
        STATUS_CODES.NOT_FOUND,
        ERROR_MESSAGES.TASK_NOT_FOUND
      );
    }

    // Send task directly (matching frontend expectations)
    res.status(STATUS_CODES.OK).json(task);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 * 
 * Expected request body:
 * {
 *   "title": "Task title",
 *   "description": "Task description (optional)",
 *   "status": "todo" (optional, defaults to "todo")
 * }
 * 
 * Response format:
 * {
 *   "id": "task_id",
 *   "title": "Task title",
 *   "description": "Task description",
 *   "status": "todo",
 *   "createdAt": "2024-01-01T00:00:00.000Z",
 *   "updatedAt": "2024-01-01T00:00:00.000Z"
 * }
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    // Create task with user ownership
    const task = await Task.create({
      title,
      description: description || '',
      status: status || 'todo',
      userId: req.user.id, // Associate task with authenticated user
    });

    // Send created task (matching frontend expectations)
    res.status(STATUS_CODES.CREATED).json(task);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 * 
 * Expected request body (all fields optional):
 * {
 *   "title": "Updated title",
 *   "description": "Updated description",
 *   "status": "in-progress"
 * }
 * 
 * Response format:
 * {
 *   "id": "task_id",
 *   "title": "Updated title",
 *   "description": "Updated description",
 *   "status": "in-progress",
 *   "createdAt": "2024-01-01T00:00:00.000Z",
 *   "updatedAt": "2024-01-01T00:00:00.000Z"
 * }
 */
export const updateTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    // Find task and ensure user owns it
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return sendError(
        res,
        STATUS_CODES.NOT_FOUND,
        ERROR_MESSAGES.TASK_NOT_FOUND
      );
    }

    // Update fields if provided
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    // Save updated task
    await task.save();

    // Send updated task (matching frontend expectations)
    res.status(STATUS_CODES.OK).json(task);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 * 
 * Response format:
 * {
 *   "success": true,
 *   "message": "Task deleted successfully"
 * }
 */
export const deleteTask = async (req, res, next) => {
  try {
    // Find and delete task (ensure user owns it)
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return sendError(
        res,
        STATUS_CODES.NOT_FOUND,
        ERROR_MESSAGES.TASK_NOT_FOUND
      );
    }

    sendSuccess(res, STATUS_CODES.OK, {}, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};
