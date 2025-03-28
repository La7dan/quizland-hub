
import express from 'express';
import pool, { getConnectionStatus } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Track the last successful connection time to avoid excessive checking
let lastConnectionCheck = 0;
const CONNECTION_CHECK_INTERVAL = 30000; // 30 seconds

// Test database connection
router.get('/check-connection', async (req, res) => {
  const now = Date.now();
  
  // Only check connection if it's been more than 30 seconds since last check
  if (now - lastConnectionCheck < CONNECTION_CHECK_INTERVAL) {
    const { isConnected } = getConnectionStatus();
    return res.json({ 
      success: isConnected, 
      message: isConnected ? 'Using cached connection status (connected)' : 'Using cached connection status (disconnected)', 
      cached: true 
    });
  }
  
  try {
    console.log('Attempting database connection (API check)...');
    const client = await pool.connect();
    client.release();
    
    console.log('Database connection successful (API check)');
    lastConnectionCheck = now;
    
    res.json({ 
      success: true, 
      message: 'Database connection successful',
      cached: false
    });
  } catch (error) {
    console.error('Database connection error (API check):', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
});

// Get all tables in the database
router.get('/tables', requireAuth, async (req, res) => {
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

// Clear a specific table
router.post('/tables/clear', requireAuth, async (req, res) => {
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

// Clear all tables
router.post('/tables/clear-all', requireAuth, async (req, res) => {
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

// Delete a table
router.post('/tables/delete', requireAuth, async (req, res) => {
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

// Create a table
router.post('/tables/create', requireAuth, async (req, res) => {
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

// Run custom SQL
router.post('/execute-sql', async (req, res) => {
  const { sql } = req.body;
  
  if (!sql) {
    return res.status(400).json({ success: false, message: 'SQL query is required' });
  }

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
