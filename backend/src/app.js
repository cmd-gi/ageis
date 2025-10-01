/**
 * Main Application Configuration
 * Configures Express app with middleware, routes, and error handling
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

/**
 * Create and configure Express application
 * @returns {express.Application}
 */
const createApp = () => {
  const app = express();

  // ============================================
  // SECURITY MIDDLEWARE
  // ============================================

  /**
   * Helmet - Sets various HTTP headers for security
   * Protects against common vulnerabilities
   */
  app.use(helmet());

  /**
   * CORS - Enable Cross-Origin Resource Sharing
   * Allows frontend to communicate with backend
   * Configure based on environment
   */
  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        'https://ageis.vercel.app',
        'https://ageis.vercel.app/',
        'http://localhost:5173',
        'http://localhost:8081',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:8081'
      ].filter(Boolean); // Remove undefined values
      
      // Check if origin is in allowed list
      if (allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies and authorization headers
    optionsSuccessStatus: 200,
  };

  app.use(cors(corsOptions));

  /**
   * Rate Limiting - Prevent brute force attacks
   * Limits number of requests from single IP
   */
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

  // Apply rate limiting to all API routes
  app.use('/api/', limiter);

  // ============================================
  // BODY PARSING MIDDLEWARE
  // ============================================

  /**
   * Parse JSON bodies
   * Enables req.body to be accessed as JavaScript object
   */
  app.use(express.json());

  /**
   * Parse URL-encoded bodies
   * For form submissions
   */
  app.use(express.urlencoded({ extended: true }));

  // ============================================
  // LOGGING MIDDLEWARE (Development)
  // ============================================

  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`, {
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    });
  }

  // ============================================
  // HEALTH CHECK ENDPOINT
  // ============================================

  /**
   * Health check endpoint
   * Useful for deployment platforms and monitoring
   */
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  });

  // ============================================
  // API ROUTES
  // ============================================

  /**
   * Authentication routes
   * /api/signup, /api/login, /api/profile
   */
  app.use('/api', authRoutes);

  /**
   * Task routes
   * /api/tasks
   */
  app.use('/api/tasks', taskRoutes);

  // ============================================
  // API DOCUMENTATION ENDPOINT
  // ============================================

  /**
   * API documentation endpoint
   * Lists all available endpoints
   */
  app.get('/api', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Aegis API Server',
      version: '1.0.0',
      endpoints: {
        health: 'GET /api/health',
        auth: {
          signup: 'POST /api/signup',
          login: 'POST /api/login',
          profile: {
            get: 'GET /api/profile',
            update: 'PUT /api/profile',
          },
        },
        tasks: {
          getAll: 'GET /api/tasks',
          getById: 'GET /api/tasks/:id',
          create: 'POST /api/tasks',
          update: 'PUT /api/tasks/:id',
          delete: 'DELETE /api/tasks/:id',
        },
      },
      documentation: 'See README.md for detailed API documentation',
    });
  });

  // ============================================
  // ERROR HANDLING
  // ============================================

  /**
   * 404 Not Found handler
   * Handles requests to undefined routes
   */
  app.use(notFound);

  /**
   * Global error handler
   * Catches all errors and formats response
   */
  app.use(errorHandler);

  return app;
};

export default createApp;
