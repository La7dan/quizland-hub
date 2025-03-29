
import express from 'express';
import pool from '../../config/database.js';
import { requireAuth, requireCoachOrAdmin } from '../../middleware/auth.js';

const router = express.Router();

// Get pending evaluations for a coach
router.get('/pending/:coachId', requireAuth, requireCoachOrAdmin, async (req, res) => {
  const { coachId } = req.params;
  
  // Only allow coaches to see their own evaluations
  if (req.user.role === 'coach' && req.user.id !== parseInt(coachId)) {
    return res.status(403).json({ 
      success: false, 
      message: 'You can only view your own evaluations' 
    });
  }
  
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT e.id, e.member_id, e.status, e.nominated_at, e.coach_id, e.evaluation_date, e.evaluation_pdf,
             m.name as member_name, m.member_id as member_code, m.classes_count
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
router.post('/:id/approve', requireAuth, requireCoachOrAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    // First check if this coach has permission to approve this evaluation
    const client = await pool.connect();
    
    if (req.user.role === 'coach') {
      const checkResult = await client.query(`
        SELECT e.* FROM evaluations e WHERE e.id = $1 AND e.coach_id = $2
      `, [id, req.user.id]);
      
      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(403).json({ 
          success: false, 
          message: 'You can only approve your own evaluations' 
        });
      }
    }
    
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
router.post('/:id/disapprove', requireAuth, requireCoachOrAdmin, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  if (!reason) {
    return res.status(400).json({ success: false, message: 'Reason is required' });
  }
  
  try {
    // First check if this coach has permission to disapprove this evaluation
    const client = await pool.connect();
    
    if (req.user.role === 'coach') {
      const checkResult = await client.query(`
        SELECT e.* FROM evaluations e WHERE e.id = $1 AND e.coach_id = $2
      `, [id, req.user.id]);
      
      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(403).json({ 
          success: false, 
          message: 'You can only disapprove your own evaluations' 
        });
      }
    }
    
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
