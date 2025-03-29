
import express from 'express';
import pool from '../../config/database.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Route to set up initial test accounts
router.post('/setup-test-accounts', async (req, res) => {
  try {
    console.log('Setting up test accounts...');
    const client = await pool.connect();
    
    // Create test coach account if it doesn't exist
    const coachExists = await client.query('SELECT id FROM users WHERE username = $1', ['coach']);
    
    if (coachExists.rows.length === 0) {
      // Hash the password
      const hashedPassword = await bcrypt.hash('coach123', 10);
      
      await client.query(
        `INSERT INTO users (username, password, email, role) 
         VALUES ($1, $2, $3, $4)`,
        ['coach', hashedPassword, 'coach@example.com', 'coach']
      );
      console.log('Test coach account created');
    } else {
      console.log('Test coach account already exists');
    }
    
    // Create test admin account if it doesn't exist
    const adminExists = await client.query('SELECT id FROM users WHERE username = $1', ['admin']);
    
    if (adminExists.rows.length === 0) {
      // Hash the password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await client.query(
        `INSERT INTO users (username, password, email, role) 
         VALUES ($1, $2, $3, $4)`,
        ['admin', hashedPassword, 'admin@example.com', 'super_admin']
      );
      console.log('Test admin account created');
    } else {
      console.log('Test admin account already exists');
    }
    
    // Get all users for debugging
    const allUsers = await client.query('SELECT id, username, email, role FROM users');
    console.log('All users in database:', allUsers.rows);
    
    client.release();
    
    res.json({ 
      success: true, 
      message: 'Test accounts set up successfully',
      users: allUsers.rows
    });
  } catch (error) {
    console.error('Error setting up test accounts:', error);
    res.status(500).json({ 
      success: false, 
      message: `Error setting up test accounts: ${error.message}` 
    });
  }
});

// Route to list all users (for debugging only - should be protected in production)
router.get('/list-all', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT id, username, email, role FROM users');
    client.release();
    
    res.json({ 
      success: true, 
      users: result.rows 
    });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ 
      success: false, 
      message: `Error listing users: ${error.message}` 
    });
  }
});

export default router;
