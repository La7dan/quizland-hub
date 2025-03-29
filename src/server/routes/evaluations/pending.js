
import express from 'express';
import pool from '../../config/database.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

// Get pending evaluations for a coach
router.get('/pending/:coachId', requireAuth, async (req, res) => {
  const { coachId } = req.params;
  
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT e.id, e.member_id, e.status, e.nominated_at, e.coach_id, e.evaluation_date, e.evaluation_pdf,
             m.name as member_name, m.member_id as member_code
      FROM evaluations e
      JOIN members m ON e.member_id = m.id
      WHERE e.coach_id = $1 AND e.status = 'pending'
      ORDER BY e.nominated_at DESC;
    `, [coachId]);
    client.release();
    
    res.json({ success: true, evaluations: result.rows });
  } catch (error) {
    console.error('Error fetching pending evaluations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch pending evaluations', 
      error: error.message 
    });
  }
});

// Approve an evaluation
router.post('/:id/approve', requireAuth, async (req, res) => {
  const { id } = req.params;
  
  try {
    const client = await pool.connect();
    const result = await client.query(`
      UPDATE evaluations
      SET status = 'approved', approved_at = NOW()
      WHERE id = $1
      RETURNING id;
    `, [id]);
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Evaluation not found' });
    }
    
    res.json({ success: true, message: 'Evaluation approved successfully' });
  } catch (error) {
    console.error('Error approving evaluation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve evaluation', 
      error: error.message 
    });
  }
});

// Disapprove an evaluation
router.post('/:id/disapprove', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  if (!reason) {
    return res.status(400).json({ success: false, message: 'Reason is required' });
  }
  
  try {
    const client = await pool.connect();
    const result = await client.query(`
      UPDATE evaluations
      SET status = 'disapproved', disapproved_at = NOW(), disapproval_reason = $1
      WHERE id = $2
      RETURNING id;
    `, [reason, id]);
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Evaluation not found' });
    }
    
    res.json({ success: true, message: 'Evaluation disapproved successfully' });
  } catch (error) {
    console.error('Error disapproving evaluation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to disapprove evaluation', 
      error: error.message 
    });
  }
});

export default router;
