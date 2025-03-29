
import express from 'express';
import pool from './config/database.js';
import { SERVER_CONFIG } from './config/server.js';
import { setupMiddleware, setupProductionRoutes } from './middleware/setup.js';
import { setupRoutes } from './routes/index.js';
import { initializeDatabase } from './utils/databaseInit.js';

const app = express();

// Setup middleware and get dirname
const { __dirname } = setupMiddleware(app);

// Apply routes
setupRoutes(app);

// Setup production routes (should be after API routes)
setupProductionRoutes(app, __dirname);

// Start the server
const server = app.listen(SERVER_CONFIG.PORT, () => {
  console.log(`Server running on port ${SERVER_CONFIG.PORT}`);
  
  // Initialize database
  initializeDatabase()
    .then(success => {
      if (success) {
        console.log('Database initialization completed successfully');
      }
    })
    .catch(err => {
      console.error('Database initialization failed:', err);
    });
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    pool.end();
    console.log('Database pool has ended');
    process.exit(0);
  });
});

export default app;
