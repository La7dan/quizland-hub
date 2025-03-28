
import express from 'express';
import pool from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

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

// Import members from CSV - Updated to better handle duplicates
router.post('/import', requireAuth, async (req, res) => {
  const { members } = req.body;
  
  if (!members || !Array.isArray(members) || members.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid or empty members data' 
    });
  }

  try {
    const client = await pool.connect();
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Deduplicate members by member_id to prevent conflicts
    const memberIds = new Set();
    const uniqueMembers = [];
    
    // Use the last occurrence of each member_id
    for (let i = members.length - 1; i >= 0; i--) {
      const member = members[i];
      if (member.member_id && !memberIds.has(member.member_id)) {
        memberIds.add(member.member_id);
        uniqueMembers.unshift(member); // Add to the front to maintain original order
      }
    }
    
    console.log(`Server: Processing import for ${uniqueMembers.length} unique members (from ${members.length} total)`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Process in smaller batches to prevent "ON CONFLICT DO UPDATE command cannot affect row a second time"
    const batchSize = 25; // Smaller batch size
    const batches = [];
    
    for (let i = 0; i < uniqueMembers.length; i += batchSize) {
      batches.push(uniqueMembers.slice(i, i + batchSize));
    }
    
    console.log(`Split into ${batches.length} batches for processing`);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} members`);
      
      // Process each member in the batch
      for (const member of batch) {
        try {
          if (!member.member_id || !member.name) {
            throw new Error(`Missing required fields for member: ${JSON.stringify(member)}`);
          }
          
          // Process level_id - if provided directly, use it
          let levelId = member.level_id;
          
          // If level_id is not provided but level_code is, look up the level
          if (!levelId && member.level_code) {
            const levelResult = await client.query(
              'SELECT id FROM quiz_levels WHERE code = $1',
              [member.level_code]
            );
            
            if (levelResult.rows.length > 0) {
              levelId = levelResult.rows[0].id;
              console.log(`Found level ID ${levelId} for code ${member.level_code}`);
            } else {
              console.log(`No level found for code ${member.level_code}`);
            }
          }
          
          // Check if coach exists
          let coachId = member.coach_id;
          if (!coachId && member.coach_name) {
            const coachResult = await client.query(
              'SELECT id FROM users WHERE username = $1 AND role IN (\'coach\', \'admin\')',
              [member.coach_name]
            );
            
            if (coachResult.rows.length > 0) {
              coachId = coachResult.rows[0].id;
            }
          }
          
          // Ensure classes_count is a number
          const classesCount = typeof member.classes_count === 'number' ? member.classes_count : 0;
          
          // Do upsert with proper parameterization to avoid SQL injection
          const result = await client.query(
            `INSERT INTO members (member_id, name, level_id, classes_count, coach_id) 
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (member_id) 
             DO UPDATE SET 
               name = EXCLUDED.name,
               level_id = EXCLUDED.level_id,
               classes_count = EXCLUDED.classes_count,
               coach_id = EXCLUDED.coach_id
             RETURNING id`,
            [member.member_id, member.name, levelId, classesCount, coachId]
          );
          
          if (result.rows.length > 0) {
            successCount++;
          } else {
            throw new Error('Insert failed without error');
          }
        } catch (error) {
          errorCount++;
          console.error('Error importing member:', error);
          errors.push(`${member.name || 'Unknown member'}: ${error.message}`);
        }
      }
    }
    
    // Commit or rollback based on success
    if (successCount > 0) {
      await client.query('COMMIT');
      console.log(`Import successful: ${successCount} members imported, ${errorCount} errors`);
    } else {
      await client.query('ROLLBACK');
      throw new Error('No members were imported successfully');
    }
    
    client.release();
    
    res.json({
      success: true,
      message: `Imported ${successCount} members with ${errorCount} errors`,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error importing members:', error);
    
    // Ensure transaction is rolled back
    try {
      const client = await pool.connect();
      await client.query('ROLLBACK');
      client.release();
    } catch (rollbackError) {
      console.error('Error rolling back transaction:', rollbackError);
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to import members', 
      error: error.message 
    });
  }
});

export default router;
