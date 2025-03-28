
import express from 'express';
import pool from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../config/upload.js';

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

// Upload evaluation PDF file
router.post('/upload-file', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    console.log('File uploaded successfully:', req.file.filename);
    
    // Return the file path to be stored in the database
    res.json({ 
      success: true, 
      message: 'File uploaded successfully',
      filePath: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to upload file'
    });
  }
});

// Upload evaluation record - modified to check for existing evaluations with the same date
router.post('/upload', requireAuth, async (req, res) => {
  const { member_id, evaluation_date, file_url, coach_id } = req.body;
  
  if (!member_id || !evaluation_date) {
    return res.status(400).json({ 
      success: false, 
      message: 'Member ID and evaluation date are required' 
    });
  }
  
  try {
    const client = await pool.connect();
    
    // Check if member already has an evaluation for this date
    const checkResult = await client.query(`
      SELECT COUNT(*) FROM evaluations
      WHERE member_id = $1 AND evaluation_date = $2
    `, [member_id, evaluation_date]);
    
    if (checkResult.rows[0].count > 0) {
      client.release();
      return res.status(400).json({
        success: false,
        message: 'Member already has an evaluation for this date'
      });
    }
    
    const result = await client.query(`
      INSERT INTO evaluations (member_id, status, nominated_at, evaluation_date, evaluation_pdf, coach_id)
      VALUES ($1, 'pending', NOW(), $2, $3, $4)
      RETURNING id;
    `, [member_id, evaluation_date, file_url, coach_id]);
    client.release();
    
    res.json({ 
      success: true, 
      message: 'Evaluation uploaded successfully',
      evaluation_id: result.rows[0].id 
    });
  } catch (error) {
    console.error('Error uploading evaluation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload evaluation', 
      error: error.message 
    });
  }
});

export default router;
