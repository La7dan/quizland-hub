
import express from 'express';
import pool from '../../config/database.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

// Create a member
router.post('/', requireAuth, async (req, res) => {
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

export default router;
