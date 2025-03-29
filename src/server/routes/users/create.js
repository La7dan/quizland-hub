
import express from 'express';
import pool from '../../config/database.js';
import bcrypt from 'bcrypt';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

const router = express.Router();

// Create a new user
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { username, email, password, role = 'coach' } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }
    
    // Validate role
    if (!['coach', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be coach, admin, or super_admin'
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const client = await pool.connect();
    
    // Check if username or email already exists
    const checkResult = await client.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (checkResult.rows.length > 0) {
      client.release();
      return res.status(409).json({
        success: false,
        message: 'Username or email already exists'
      });
    }
    
    // Insert new user
    const result = await client.query(
      `INSERT INTO users (username, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, username, email, role, created_at`,
      [username, email, hashedPassword, role]
    );
    
    client.release();
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

export default router;
