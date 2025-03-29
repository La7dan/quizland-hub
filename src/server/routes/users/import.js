
import express from 'express';
import pool from '../../config/database.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Import multiple users at once
router.post('/import', requireAuth, requireAdmin, async (req, res) => {
  const { users } = req.body;
  
  if (!users || !Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid or empty users data' 
    });
  }

  try {
    const client = await pool.connect();
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Deduplicate users by username
    const uniqueUsers = Object.values(
      users.reduce((acc, user) => {
        if (user.username) {
          acc[user.username] = user;
        }
        return acc;
      }, {})
    );
    
    console.log(`Processing import for ${uniqueUsers.length} unique users (from ${users.length} total)`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Process each user
    for (const user of uniqueUsers) {
      try {
        if (!user.username || !user.password || !user.email) {
          throw new Error(`Missing required fields for user: ${JSON.stringify(user)}`);
        }
        
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        
        // Validate role
        const role = user.role || 'coach';
        if (!['coach', 'admin', 'super_admin'].includes(role)) {
          throw new Error(`Invalid role "${role}" for user ${user.username}`);
        }
        
        // Insert or update the user
        const result = await client.query(
          `INSERT INTO users (username, password, email, role) 
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (username) 
           DO UPDATE SET 
             password = EXCLUDED.password,
             email = EXCLUDED.email,
             role = EXCLUDED.role
           RETURNING id`,
          [user.username, hashedPassword, user.email, role]
        );
        
        if (result.rows.length > 0) {
          successCount++;
        } else {
          throw new Error('Insert failed without error');
        }
      } catch (error) {
        errorCount++;
        console.error('Error importing user:', error);
        errors.push(`${user.username || 'Unknown user'}: ${error.message}`);
      }
    }
    
    // Commit or rollback based on success
    if (successCount > 0) {
      await client.query('COMMIT');
      console.log(`Import successful: ${successCount} users imported, ${errorCount} errors`);
    } else {
      await client.query('ROLLBACK');
      throw new Error('No users were imported successfully');
    }
    
    client.release();
    
    res.json({
      success: true,
      message: `Imported ${successCount} users with ${errorCount} errors`,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error importing users:', error);
    
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
      message: 'Failed to import users', 
      error: error.message 
    });
  }
});

export default router;
