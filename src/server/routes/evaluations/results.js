
import express from 'express';
import pool from '../../config/database.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

// Public endpoint to check evaluation results for members
router.post('/check-results', async (req, res) => {
  const { memberName, memberCode, coachId } = req.body;
  
  if (!memberName || !memberCode || !coachId) {
    return res.status(400).json({
      success: false,
      message: 'Member name, code, and coach ID are required'
    });
  }
  
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT e.id, e.status, e.nominated_at, e.evaluation_date, e.evaluation_result,
             m.name as member_name, m.member_id as member_code,
             u.name as coach_name
      FROM evaluations e
      JOIN members m ON e.member_id = m.id
      JOIN users u ON e.coach_id = u.id
      WHERE LOWER(m.name) = LOWER($1)
      AND LOWER(m.member_id) = LOWER($2)
      AND e.coach_id = $3
      ORDER BY e.evaluation_date DESC
      LIMIT 1
    `, [memberName.trim(), memberCode.trim(), coachId]);
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No evaluation found with the provided details'
      });
    }
    
    res.json({
      success: true,
      evaluation: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching evaluation results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluation results',
      error: error.message
    });
  }
});

// Mark evaluation as completed when it's passed
router.post('/:id/update-result', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { result, pdfPath } = req.body;
  
  if (!result) {
    return res.status(400).json({ success: false, message: 'Result is required' });
  }
  
  try {
    const client = await pool.connect();
    
    // If result is 'passed', also mark as 'completed'
    const status = result === 'passed' ? 'completed' : 'pending';
    
    const updateQuery = pdfPath 
      ? `UPDATE evaluations 
         SET evaluation_result = $1, status = $2, evaluation_date = NOW(), evaluation_pdf = $3 
         WHERE id = $4 RETURNING id;`
      : `UPDATE evaluations 
         SET evaluation_result = $1, status = $2, evaluation_date = NOW() 
         WHERE id = $3 RETURNING id;`;
         
    const queryParams = pdfPath 
      ? [result, status, pdfPath, id]
      : [result, status, id];
    
    const queryResult = await client.query(updateQuery, queryParams);
    client.release();
    
    if (queryResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Evaluation not found' });
    }
    
    res.json({ 
      success: true, 
      message: `Evaluation result updated to "${result}" and ${status === 'completed' ? 'marked as completed' : 'remains pending'}`
    });
    
  } catch (error) {
    console.error('Error updating evaluation result:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update evaluation result', 
      error: error.message 
    });
  }
});

// New endpoint to get completed evaluations
router.get('/completed', requireAuth, async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT e.id, e.status, e.nominated_at, e.evaluation_date, e.evaluation_pdf,
             e.evaluation_result, e.member_id, e.coach_id,
             m.name as member_name, m.member_id as member_code
      FROM evaluations e
      JOIN members m ON e.member_id = m.id
      WHERE e.status = 'completed' OR e.evaluation_result IS NOT NULL
      ORDER BY e.evaluation_date DESC NULLS LAST;
    `);
    client.release();
    
    res.json({ success: true, evaluations: result.rows });
  } catch (error) {
    console.error('Error fetching completed evaluations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch completed evaluations', 
      error: error.message 
    });
  }
});

export default router;
