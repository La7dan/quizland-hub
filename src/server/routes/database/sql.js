
import express from 'express';
import pool from '../../config/database.js';

const router = express.Router();

// Run custom SQL - For public queries vs admin queries
router.post('/execute-sql', async (req, res) => {
  const { sql, isPublicQuery, params } = req.body;
  
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
    const result = await client.query(sql, params || []);
    client.release();
    
    res.json({ 
      success: true, 
      message: 'SQL executed successfully', 
      rowCount: result.rowCount,
      rows: result.rows 
    });
  } catch (error) {
    console.error('Error executing SQL:', error);
    
    // Provide more helpful error messages for common SQL errors
    let errorMessage = error.message;
    
    if (error.code === '42703') { // Column does not exist
      const columnMatch = error.message.match(/column "(.*?)" does not exist/);
      const columnName = columnMatch ? columnMatch[1] : 'unknown';
      errorMessage = `Column '${columnName}' does not exist in the table. Please check your query and the database schema.`;
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to execute SQL', 
      error: errorMessage,
      details: error.code ? `Error code: ${error.code}` : undefined
    });
  }
});

export default router;
