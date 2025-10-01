/**
 * Server Entry Point
 * Starts the Express server and connects to MongoDB
 * 
 * This is the main file that runs when you start the backend
 * It loads environment variables, connects to the database, and starts the server
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import createApp from './app.js';
import connectDB from './config/db.js';

// ============================================
// ENVIRONMENT VARIABLES
// ============================================

/**
 * Load environment variables from .env file
 * Must be called before accessing process.env
 */
dotenv.config();

// ============================================
// CONFIGURATION
// ============================================

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// INITIALIZE APPLICATION
// ============================================

/**
 * Start the server
 * Connects to database first, then starts Express server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();

    // Create Express app
    const app = createApp();

    // Start listening for requests
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('🚀 Aegis Backend API Server');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
      console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      console.log('Available Endpoints:');
      console.log('  POST   /api/signup       - Register new user');
      console.log('  POST   /api/login        - Login user');
      console.log('  GET    /api/profile      - Get user profile');
      console.log('  PUT    /api/profile      - Update user profile');
      console.log('  GET    /api/tasks        - Get all tasks');
      console.log('  POST   /api/tasks        - Create new task');
      console.log('  GET    /api/tasks/:id    - Get task by ID');
      console.log('  PUT    /api/tasks/:id    - Update task');
      console.log('  DELETE /api/tasks/:id    - Delete task');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
    });

    // ============================================
    // GRACEFUL SHUTDOWN
    // ============================================

    /**
     * Handle graceful shutdown
     * Close server and database connections properly
     */
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('✅ HTTP server closed');

        try {
          await mongoose.connection.close();
          console.log('✅ MongoDB connection closed');
          process.exit(0);
        } catch (err) {
          console.error('❌ Error during shutdown:', err);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ============================================
// UNHANDLED REJECTION/EXCEPTION HANDLERS
// ============================================

/**
 * Handle unhandled promise rejections
 * Prevents server from crashing silently
 */
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  process.exit(1);
});

/**
 * Handle uncaught exceptions
 * Last resort error handler
 */
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err);
  process.exit(1);
});

// ============================================
// START THE SERVER
// ============================================

startServer();
