
import express from 'express';
import { initializeDatabase } from '../../utils/databaseInit.js';

const router = express.Router();

// API endpoint to initialize the database
router.get('/initialize', async (req, res) => {
  try {
    const result = await initializeDatabase();
    res.json(result);
  } catch (error) {
    console.error('Database initialization API error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during database initialization'
    });
  }
});

export default router;
