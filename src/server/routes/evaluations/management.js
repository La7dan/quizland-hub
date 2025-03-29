
import express from 'express';
import pool from '../../config/database.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

// Delete a single evaluation
router.delete('/:id', requireAuth, async (req, res) => {
  // Only allow admins to delete evaluations
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to delete evaluations'
    });
  }

  const { id } = req.params;
  
  try {
    const client = await pool.connect();
    const result = await client.query('DELETE FROM evaluations WHERE id = $1 RETURNING id', [id]);
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Evaluation not found' });
    }
    
    res.json({ success: true, message: 'Evaluation deleted successfully' });
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete evaluation', 
      error: error.message 
    });
  }
});

// Bulk delete evaluations
router.delete('/bulk', requireAuth, async (req, res) => {
  // Only allow admins to delete evaluations
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to delete evaluations'
    });
  }

  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'No evaluation IDs provided for deletion'
    });
  }
  
  try {
    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM evaluations WHERE id IN (${ids.map((_, i) => `$${i + 1}`).join(',')}) RETURNING id`,
      ids
    );
    client.release();
    
    res.json({ 
      success: true, 
      message: `${result.rowCount} evaluation(s) deleted successfully`,
      deleted: result.rows.map(row => row.id)
    });
  } catch (error) {
    console.error('Error deleting evaluations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete evaluations', 
      error: error.message 
    });
  }
});

export default router;
