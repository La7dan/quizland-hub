import express from 'express';
import pg from 'pg';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import session from 'express-session';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 5000;

// Environment variables or defaults
const SESSION_SECRET = process.env.SESSION_SECRET || 'quiz-app-secret-key-change-in-production';
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

// Middleware
app.use(cors({
  origin: true, // Allow the frontend origin
  credentials: true // Allow cookies to be sent
}));
app.use(cookieParser());
app.use(bodyParser.json());

// Session configuration
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true, // Prevent client-side JS from reading the cookie
    maxAge: COOKIE_MAX_AGE
  }
}));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// Database connection configuration
const pool = new Pool({
  host: '209.74.89.41',
  user: 'quiz',
  password: 'Lal@13161',
  database: 'quiz',
  port: 5432,
});

// Authentication middleware
const requireAuth = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, username, email, role FROM users WHERE id = $1',
      [req.session.userId]
    );
    client.release();
    
    if (result.rows.length === 0) {
      req.session.destroy();
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }
  
  try {
    const client = await pool.connect();
    
    // Query the users table with prepared statement to prevent SQL injection
    const result = await client.query(
      'SELECT id, username, email, role, password FROM users WHERE username = $1 LIMIT 1',
      [username]
    );
    
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    const userData = result.rows[0];
    
    // Verify password (in a production app, this would use bcrypt)
    if (userData.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    
    // Set user ID in session
    req.session.userId = userData.id;
    
    // Create a clean user object without the password
    const cleanUserData = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role
    };
    
    res.json({ success: true, user: cleanUserData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, message: 'Error during logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

app.get('/api/auth/check', requireAuth, (req, res) => {
  res.json({ 
    authenticated: true, 
    user: req.user 
  });
});

// Test database connection
app.get('/api/check-connection', async (req, res) => {
  try {
    console.log('Attempting database connection...');
    const client = await pool.connect();
    client.release();
    console.log('Database connection successful');
    res.json({ success: true, message: 'Database connection successful' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ success: false, message: 'Database connection failed', error: error.message });
  }
});

// Get all tables in the database
app.get('/api/tables', requireAuth, async (req, res) => {
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
app.post('/api/tables/clear', requireAuth, async (req, res) => {
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
app.post('/api/tables/clear-all', requireAuth, async (req, res) => {
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
app.post('/api/tables/delete', requireAuth, async (req, res) => {
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
app.post('/api/tables/create', requireAuth, async (req, res) => {
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
app.post('/api/execute-sql', requireAuth, async (req, res) => {
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

// Get all members
app.get('/api/members', requireAuth, async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT m.id, m.member_id, m.name, m.classes_count, m.coach_id, m.created_at, 
             l.id AS level_id, l.name AS level_name, l.code AS level_code,
             u.username AS coach_name
      FROM members m
      LEFT JOIN quiz_levels l ON m.level_id = l.id
      LEFT JOIN users u ON m.coach_id = u.id
      ORDER BY m.name;
    `);
    client.release();
    res.json({ success: true, members: result.rows });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch members', error: error.message });
  }
});

// Create a member
app.post('/api/members', requireAuth, async (req, res) => {
  const { member_id, name, level_id, classes_count, coach_id } = req.body;
  
  if (!member_id || !name) {
    return res.status(400).json({ success: false, message: 'Member ID and name are required' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(`
      INSERT INTO members (member_id, name, level_id, classes_count, coach_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `, [member_id, name, level_id || null, classes_count || 0, coach_id || null]);
    client.release();
    
    res.json({ 
      success: true, 
      message: 'Member created successfully', 
      member_id: result.rows[0].id 
    });
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create member', 
      error: error.message 
    });
  }
});

// Update a member
app.put('/api/members/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { member_id, name, level_id, classes_count, coach_id } = req.body;
  
  if (!member_id || !name) {
    return res.status(400).json({ success: false, message: 'Member ID and name are required' });
  }

  try {
    const client = await pool.connect();
    await client.query(`
      UPDATE members
      SET member_id = $1, name = $2, level_id = $3, classes_count = $4, coach_id = $5
      WHERE id = $6;
    `, [member_id, name, level_id || null, classes_count || 0, coach_id || null, id]);
    client.release();
    
    res.json({ success: true, message: 'Member updated successfully' });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update member', 
      error: error.message 
    });
  }
});

// Delete a member
app.delete('/api/members/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const client = await pool.connect();
    await client.query('DELETE FROM members WHERE id = $1;', [id]);
    client.release();
    
    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete member', 
      error: error.message 
    });
  }
});

// Import members from CSV
app.post('/api/members/import', requireAuth, async (req, res) => {
  const { members } = req.body;
  
  if (!members || !Array.isArray(members) || members.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid or empty members data' 
    });
  }

  try {
    const client = await pool.connect();
    
    // Begin transaction
    await client.query('BEGIN');
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const member of members) {
      try {
        if (!member.member_id || !member.name) {
          throw new Error(`Missing required fields for member: ${JSON.stringify(member)}`);
        }
        
        // Check if level exists for level_code
        let levelId = null;
        if (member.level_code) {
          const levelResult = await client.query(
            'SELECT id FROM quiz_levels WHERE code = $1',
            [member.level_code]
          );
          
          if (levelResult.rows.length > 0) {
            levelId = levelResult.rows[0].id;
          }
        }
        
        // Check if coach exists
        let coachId = null;
        if (member.coach_username) {
          const coachResult = await client.query(
            'SELECT id FROM users WHERE username = $1 AND role IN (\'coach\', \'admin\')',
            [member.coach_username]
          );
          
          if (coachResult.rows.length > 0) {
            coachId = coachResult.rows[0].id;
          }
        }
        
        // Insert the member
        await client.query(
          'INSERT INTO members (member_id, name, level_id, classes_count, coach_id) VALUES ($1, $2, $3, $4, $5)',
          [member.member_id, member.name, levelId, member.classes_count || 0, coachId]
        );
        
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(`${member.name || 'Unknown member'}: ${error.message}`);
      }
    }
    
    // Commit or rollback based on success
    if (successCount > 0) {
      await client.query('COMMIT');
    } else {
      await client.query('ROLLBACK');
      throw new Error('No members were imported successfully');
    }
    
    client.release();
    
    res.json({
      success: true,
      message: `Imported ${successCount} members with ${errorCount} errors`,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error importing members:', error);
    
    // Ensure transaction is rolled back
    try {
      const client = await pool.connect();
      await client.query('ROLLBACK');
      client.release();
    } catch (rollbackError) {
      console.error('Error rolling back transaction:', rollbackError);
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to import members', 
      error: error.message 
    });
  }
});

// Serve index.html for any routes not matched in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

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
