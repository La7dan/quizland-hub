
import express from 'express';
import pendingRoutes from './pending.js';
import resultRoutes from './results.js';
import managementRoutes from './management.js';
import uploadRoutes from './upload.js';

const router = express.Router();

// Mount the modular routes
router.use(pendingRoutes);
router.use(resultRoutes);
router.use(managementRoutes);
router.use(uploadRoutes);

export default router;
