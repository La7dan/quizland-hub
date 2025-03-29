
import express from 'express';
import pool from '../../config/database.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

// Update a member
router.put('/:id', requireAuth, async (req, res) => {
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

export default router;
