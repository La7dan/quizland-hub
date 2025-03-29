
import express from 'express';
import pool from '../../config/database.js';

const router = express.Router();

// Run custom SQL - For public queries vs admin queries
router.post('/execute-sql', async (req, res) => {
  const { sql, isPublicQuery } = req.body;
  
  if (!sql) {
    return res.status(400).json({ success: false, message: 'SQL query is required' });
  }

  // Check if this is an admin-only query and requires auth
  if (!isPublicQuery) {
    // Verify user is authenticated for admin queries
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }
    
    // Get user information to check if they're an admin
    try {
      const client = await pool.connect();
      const userResult = await client.query(
        'SELECT id, role FROM users WHERE id = $1',
        [req.session.userId]
      );
      client.release();
      
      if (userResult.rows.length === 0) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      
      const userRole = userResult.rows[0].role;
      
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Admin privileges required' });
      }
    } catch (error) {
      console.error('User authorization check error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to verify user authorization', 
        error: error.message 
      });
    }
  }

  // Execute the SQL query
  try {
    const client = await pool.connect();
    const result = await client.query(sql);
    client.release();
    
    res.json({ 
      success: true, 
      message: 'SQL executed successfully', 
      rowCount: result.rowCount,
      rows: result.rows 
    });
  } catch (error) {
    console.error('Error executing SQL:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to execute SQL', 
      error: error.message 
    });
  }
});

export default router;
