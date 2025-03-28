import express from 'express';
import pool, { getConnectionStatus } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Cache connection status
let cachedConnectionStatus = {
  success: false,
  timestamp: 0,
  message: 'Not checked yet'
};

const CONNECTION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to check admin privileges
const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({ success: false, message: 'Admin privileges required' });
  }
  next();
};

// Test database connection - public endpoint, no auth required
router.get('/check-connection', async (req, res) => {
  const now = Date.now();
  const { isConnected } = getConnectionStatus();
  
  // If we already know we're connected, return cached status
  if (isConnected && cachedConnectionStatus.success && 
      (now - cachedConnectionStatus.timestamp < CONNECTION_CACHE_DURATION)) {
    return res.json({ 
      success: true, 
      message: 'Using cached connection status (connected)', 
      cached: true 
    });
  }
  
  try {
    console.log('Attempting database connection (API check)...');
    const client = await pool.connect();
    client.release();
    
    console.log('Database connection successful (API check)');
    
    // Update cached status
    cachedConnectionStatus = {
      success: true,
      timestamp: now,
      message: 'Database connection successful'
    };
    
    res.json({ 
      success: true, 
      message: 'Database connection successful',
      cached: false
    });
  } catch (error) {
    console.error('Database connection error (API check):', error);
    
    // Update cached status to failure
    cachedConnectionStatus = {
      success: false,
      timestamp: now,
      message: 'Database connection failed'
    };
    
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
});

// Get all tables in the database - require admin
router.get('/tables', requireAuth, requireAdmin, async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    client.release();
    res.json({ success: true, tables: result.rows });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tables', error: error.message });
  }
});

// Clear a specific table - require admin
router.post('/tables/clear', requireAuth, requireAdmin, async (req, res) => {
  const { tableName } = req.body;
  
  if (!tableName) {
    return res.status(400).json({ success: false, message: 'Table name is required' });
  }

  try {
    const client = await pool.connect();
    await client.query(`TRUNCATE TABLE "${tableName}" CASCADE;`);
    client.release();
    res.json({ success: true, message: `Table ${tableName} cleared successfully` });
  } catch (error) {
    console.error(`Error clearing table ${tableName}:`, error);
    res.status(500).json({ success: false, message: `Failed to clear table ${tableName}`, error: error.message });
  }
});

// Clear all tables - require admin
router.post('/tables/clear-all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    const tables = result.rows.map(row => row.table_name);
    
    if (tables.length === 0) {
      client.release();
      return res.json({ success: true, message: 'No tables to clear' });
    }
    
    await client.query(`TRUNCATE ${tables.map(table => `"${table}"`).join(', ')} CASCADE;`);
    client.release();
    
    res.json({ success: true, message: 'All tables cleared successfully' });
  } catch (error) {
    console.error('Error clearing all tables:', error);
    res.status(500).json({ success: false, message: 'Failed to clear all tables', error: error.message });
  }
});

// Delete a table - require admin
router.post('/tables/delete', requireAuth, requireAdmin, async (req, res) => {
  const { tableName } = req.body;
  
  if (!tableName) {
    return res.status(400).json({ success: false, message: 'Table name is required' });
  }

  try {
    const client = await pool.connect();
    await client.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
    client.release();
    res.json({ success: true, message: `Table ${tableName} deleted successfully` });
  } catch (error) {
    console.error(`Error deleting table ${tableName}:`, error);
    res.status(500).json({ success: false, message: `Failed to delete table ${tableName}`, error: error.message });
  }
});

// Create a table - require admin
router.post('/tables/create', requireAuth, requireAdmin, async (req, res) => {
  const { tableName, columns } = req.body;
  
  if (!tableName || !columns || !columns.length) {
    return res.status(400).json({ 
      success: false, 
      message: 'Table name and at least one column are required' 
    });
  }

  try {
    const client = await pool.connect();
    
    // Format columns into SQL syntax
    const columnDefinitions = columns.map(col => {
      return `"${col.name}" ${col.type}${col.constraints ? ' ' + col.constraints : ''}`;
    }).join(', ');
    
    const query = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columnDefinitions});`;
    await client.query(query);
    client.release();
    
    res.json({ success: true, message: `Table ${tableName} created successfully` });
  } catch (error) {
    console.error(`Error creating table ${tableName}:`, error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to create table ${tableName}`, 
      error: error.message 
    });
  }
});

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
