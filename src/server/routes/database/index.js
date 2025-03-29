
import express from 'express';
import connectionRoutes from './connection.js';
import tableRoutes from './tables.js';
import sqlRoutes from './sql.js';

const router = express.Router();

// Mount the modular routes
router.use(connectionRoutes);
router.use(tableRoutes);
router.use(sqlRoutes);

export default router;
