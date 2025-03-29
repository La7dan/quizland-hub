
import express from 'express';
import pool from '../../config/database.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

// Get all members
router.get('/', requireAuth, async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT m.id, m.member_id, m.name, m.classes_count, m.coach_id, m.created_at, 
             l.id AS level_id, l.name AS level_name, l.code AS level_code,
             u.username AS coach_name
      FROM members m
      LEFT JOIN quiz_levels l ON m.level_id = l.id
      LEFT JOIN users u ON m.coach_id = u.id
      ORDER BY m.name;
    `);
    client.release();
    res.json({ success: true, members: result.rows });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch members', error: error.message });
  }
});

export default router;
