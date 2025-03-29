
import express from 'express';
import pool from '../../config/database.js';
import bcrypt from 'bcrypt';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

const router = express.Router();

// Update an existing user
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;
    
    // Get the current user data
    const client = await pool.connect();
    const userResult = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (userResult.rows.length === 0) {
      client.release();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent changing super_admin role unless you're a super_admin
    const currentRole = userResult.rows[0].role;
    if (currentRole === 'super_admin' && !req.user.isSuperAdmin) {
      client.release();
      return res.status(403).json({
        success: false,
        message: 'Only super admins can modify other super admin accounts'
      });
    }
    
    // Build update query
    const updates = [];
    const values = [];
    let paramCounter = 1;
    
    if (username) {
      updates.push(`username = $${paramCounter}`);
      values.push(username);
      paramCounter++;
    }
    
    if (email) {
      updates.push(`email = $${paramCounter}`);
      values.push(email);
      paramCounter++;
    }
    
    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updates.push(`password = $${paramCounter}`);
      values.push(hashedPassword);
      paramCounter++;
    }
    
    if (role) {
      // Validate role
      if (!['coach', 'admin', 'super_admin'].includes(role)) {
        client.release();
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be coach, admin, or super_admin'
        });
      }
      
      // Only super_admin can create other super_admins
      if (role === 'super_admin' && !req.user.isSuperAdmin) {
        client.release();
        return res.status(403).json({
          success: false,
          message: 'Only super admins can create or modify super admin accounts'
        });
      }
      
      updates.push(`role = $${paramCounter}`);
      values.push(role);
      paramCounter++;
    }
    
    // If no updates provided
    if (updates.length === 0) {
      client.release();
      return res.status(400).json({
        success: false,
        message: 'No update parameters provided'
      });
    }
    
    // Add ID to values array
    values.push(id);
    
    // Execute update
    const updateQuery = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCounter} 
      RETURNING id, username, email, role, created_at
    `;
    
    const result = await client.query(updateQuery, values);
    client.release();
    
    res.json({
      success: true,
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

export default router;
