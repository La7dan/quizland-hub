
import databaseRoutes from './database/index.js';
import authRoutes from './auth.js';
import evaluationsRoutes from './evaluations.js';
import membersRoutes from './members/index.js';
import usersRoutes from './users/index.js';

export const setupRoutes = (app) => {
  // API routes
  app.use('/api/database', databaseRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/evaluations', evaluationsRoutes);
  app.use('/api/members', membersRoutes);
  app.use('/api/users', usersRoutes);
  
  // Database initialization endpoint
  app.use('/api/database', (req, res, next) => {
    console.log(`Database API request: ${req.method} ${req.path}`);
    next();
  }, databaseRoutes);
};
