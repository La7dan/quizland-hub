
import express from 'express';
import pool from '../../config/database.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

// Delete a member
router.delete('/:id', requireAuth, async (req, res) => {
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

export default router;
