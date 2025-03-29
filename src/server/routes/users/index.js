
import express from 'express';
import createRoutes from './create.js';
import getRoutes from './get.js';
import updateRoutes from './update.js';
import deleteRoutes from './delete.js';
import importRoutes from './import.js';
import setupRoutes from './setup.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all user routes except setup
router.use(['/create', '/update', '/delete', '/import'], requireAuth);
router.use(['/create', '/update', '/delete', '/import'], requireAdmin);

// Mount the routes
router.use('/create', createRoutes);
router.use('/get', getRoutes);
router.use('/update', updateRoutes);
router.use('/delete', deleteRoutes);
router.use('/import', importRoutes);
router.use('/setup', setupRoutes); // Setup routes should be accessible without authentication

export default router;
