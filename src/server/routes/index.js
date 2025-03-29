
import authRoutes from './auth.js';
import databaseRoutes from './database.js';
import membersRoutes from './members.js';
import evaluationsRoutes from './evaluations.js';

export function setupRoutes(app) {
  app.use('/api/auth', authRoutes);
  app.use('/api', databaseRoutes);
  app.use('/api/members', membersRoutes);
  app.use('/api/evaluations', evaluationsRoutes);
}
