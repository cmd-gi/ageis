/**
 * Task Routes
 * Routes for CRUD operations on tasks
 * All routes require authentication
 * All routes prefixed with /api/tasks
 */

import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation,
  taskQueryValidation,
  validate,
} from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for authenticated user
 * @access  Private
 * Query params: status, search, page, limit
 */
router.get('/', taskQueryValidation, validate, getTasks);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', createTaskValidation, validate, createTask);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID
 * @access  Private
 */
router.get('/:id', taskIdValidation, validate, getTaskById);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put('/:id', updateTaskValidation, validate, updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', taskIdValidation, validate, deleteTask);

export default router;
