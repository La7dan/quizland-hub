
import express from 'express';
import pg from 'pg';
import cors from 'cors';
import bodyParser from 'body-parser';

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection configuration
const pool = new Pool({
  host: '209.74.89.41',
  user: 'quiz',
  password: 'Lal@13161',
  database: 'quiz',
  port: 5432,
});

// Test database connection
app.get('/api/check-connection', async (req, res) => {
  try {
    const client = await pool.connect();
    client.release();
    res.json({ success: true, message: 'Database connection successful' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ success: false, message: 'Database connection failed', error: error.message });
  }
});

// Get all tables in the database
app.get('/api/tables', async (req, res) => {
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
app.post('/api/tables/clear', async (req, res) => {
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
app.post('/api/tables/clear-all', async (req, res) => {
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

// Create a table
app.post('/api/tables/create', async (req, res) => {
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
app.post('/api/execute-sql', async (req, res) => {
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle process termination
process.on('SIGINT', () => {
  pool.end();
  console.log('Database pool has ended');
  process.exit(0);
});
