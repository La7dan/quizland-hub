
import express from 'express';
import pool from '../../config/database.js';
import { requireAuth, requireAdmin, requireSuperAdmin } from '../../middleware/auth.js';

const router = express.Router();

// Delete a user
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting self
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    const client = await pool.connect();
    
    // Check if user exists and get role
    const userResult = await client.query(
      'SELECT role FROM users WHERE id = $1',
      [id]
    );
    
    if (userResult.rows.length === 0) {
      client.release();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Only super_admin can delete other admins or super_admins
    const userRole = userResult.rows[0].role;
    if ((userRole === 'admin' || userRole === 'super_admin') && !req.user.isSuperAdmin) {
      client.release();
      return res.status(403).json({
        success: false,
        message: 'Only super admins can delete admin or super admin accounts'
      });
    }
    
    // Delete user
    await client.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    
    client.release();
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// Bulk delete multiple users
router.post('/bulk-delete', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No user IDs provided for deletion'
      });
    }
    
    // Prevent deleting self
    if (ids.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    const client = await pool.connect();
    
    // Check for admins/super_admins in the list
    const rolesResult = await client.query(
      'SELECT id, role FROM users WHERE id = ANY($1::int[])',
      [ids]
    );
    
    // Only allow super_admins to delete other admins/super_admins
    if (!req.user.isSuperAdmin) {
      const restrictedUsers = rolesResult.rows.filter(
        user => user.role === 'admin' || user.role === 'super_admin'
      );
      
      if (restrictedUsers.length > 0) {
        client.release();
        return res.status(403).json({
          success: false,
          message: 'Only super admins can delete admin or super admin accounts',
          restrictedUsers
        });
      }
    }
    
    // Delete users
    const result = await client.query(
      'DELETE FROM users WHERE id = ANY($1::int[]) RETURNING id',
      [ids]
    );
    
    client.release();
    
    res.json({
      success: true,
      message: `Successfully deleted ${result.rowCount} users`,
      deletedCount: result.rowCount,
      deletedIds: result.rows.map(row => row.id)
    });
  } catch (error) {
    console.error('Error bulk deleting users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete users',
      error: error.message
    });
  }
});

export default router;
