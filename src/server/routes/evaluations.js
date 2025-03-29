
import express from 'express';
import pendingRoutes from './evaluations/pending.js';
import resultRoutes from './evaluations/results.js';
import managementRoutes from './evaluations/management.js';
import uploadRoutes from './evaluations/upload.js';

const router = express.Router();

// Mount all modular routes
router.use(pendingRoutes);
router.use(resultRoutes);
router.use(managementRoutes);
router.use(uploadRoutes);

export default router;
