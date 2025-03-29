
import express from 'express';
import pool from '../../config/database.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

// Get all users (with optional filtering)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { role } = req.query;
    let query = 'SELECT id, username, email, role, created_at FROM users';
    const queryParams = [];
    
    // Add role filter if specified
    if (role) {
      query += ' WHERE role = $1';
      queryParams.push(role);
    }
    
    // Order by creation date (newest first)
    query += ' ORDER BY created_at DESC';
    
    const client = await pool.connect();
    const result = await client.query(query, queryParams);
    client.release();
    
    res.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message
    });
  }
});

// Get a single user by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
      error: error.message
    });
  }
});

export default router;
