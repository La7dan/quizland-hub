
import express from 'express';
import pool from '../../config/database.js';
import { requireAuth } from '../../middleware/auth.js';
import { upload } from '../../config/upload.js';

const router = express.Router();

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
