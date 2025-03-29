
import express from 'express';
import tablesRoutes from './tables.js';
import sqlRoutes from './sql.js';
import connectionRoutes from './connection.js';
import initializeRoutes from './initialize.js';

const router = express.Router();

// Mount all database-related routes
router.use(tablesRoutes);
router.use(sqlRoutes);
router.use(connectionRoutes);
router.use(initializeRoutes);

export default router;
