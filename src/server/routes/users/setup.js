
import express from 'express';
import pool from '../../config/database.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Route to clean up admin and coach accounts
router.post('/cleanup-admin-accounts', async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Delete any admin, super_admin, or coach accounts
    const deleteResult = await client.query(
      `DELETE FROM users WHERE role = 'super_admin' OR role = 'admin' OR role = 'coach' OR username = 'admin' OR username = 'coach' RETURNING username, role`
    );
    
    client.release();
    
    if (deleteResult.rows.length > 0) {
      console.log('Deleted accounts:', deleteResult.rows);
      res.json({
        success: true,
        message: 'Accounts deleted successfully',
        deletedAccounts: deleteResult.rows
      });
    } else {
      res.json({
        success: true,
        message: 'No accounts found to delete'
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

export default router;
