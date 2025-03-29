
import express from 'express';
import pool from '../../config/database.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Route to clean up admin and coach accounts
router.post('/cleanup-admin-accounts', async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Delete ONLY admin and super_admin accounts
    // Do NOT delete coach accounts - they need to be preserved
    const deleteResult = await client.query(
      `DELETE FROM users WHERE role = 'super_admin' OR role = 'admin' OR username = 'admin' RETURNING username, role`
    );
    
    client.release();
    
    if (deleteResult.rows.length > 0) {
      console.log('Deleted accounts:', deleteResult.rows);
      res.json({
        success: true,
        message: 'Admin accounts deleted successfully',
        deletedAccounts: deleteResult.rows
      });
    } else {
      res.json({
        success: true,
        message: 'No admin accounts found to delete'
      });
    }
  } catch (error) {
    console.error('Error deleting accounts:', error);
    res.status(500).json({
      success: false,
      message: `Error deleting accounts: ${error.message}`
    });
  }
});

// Route to create a test coach account if none exists
router.post('/ensure-coach-account', async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Check if any coaches exist
    const checkResult = await client.query('SELECT COUNT(*) FROM users WHERE role = $1', ['coach']);
    const coachCount = parseInt(checkResult.rows[0].count);
    
    if (coachCount === 0) {
      // No coaches exist, create a test coach account
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('coach123', salt);
      
      await client.query(
        `INSERT INTO users (username, password, email, role) 
         VALUES ($1, $2, $3, $4)`,
        ['coach', hashedPassword, 'coach@example.com', 'coach']
      );
      
      client.release();
      res.json({
        success: true,
        message: 'Test coach account created successfully'
      });
    } else {
      client.release();
      res.json({
        success: true,
        message: 'Coach accounts already exist'
      });
    }
  } catch (error) {
    console.error('Error ensuring coach account:', error);
    res.status(500).json({
      success: false,
      message: `Error ensuring coach account: ${error.message}`
    });
  }
});

export default router;
