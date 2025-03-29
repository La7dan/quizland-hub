
import express from 'express';
import getRoutes from './get.js';
import createRoutes from './create.js';
import updateRoutes from './update.js';
import deleteRoutes from './delete.js';
import importRoutes from './import.js';

const router = express.Router();

// Mount all modular routes
router.use(getRoutes);
router.use(createRoutes);
router.use(updateRoutes);
router.use(deleteRoutes);
router.use(importRoutes);

export default router;
