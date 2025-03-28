
import { executeSql, sqlEscape } from '../apiService';
import { Evaluation } from './types';

export const fetchPendingEvaluationsQuery = async (coachId: number) => {
  console.log('Fetching pending evaluations for coach:', coachId);
  return await executeSql(`
    SELECT e.id, e.member_id, e.status, e.nominated_at, e.coach_id, 
           m.name as member_name, m.member_id as member_code
    FROM evaluations e
    JOIN members m ON e.member_id = m.id
    WHERE e.coach_id = ${coachId} AND e.status = 'pending'
    ORDER BY e.nominated_at DESC;
  `);
};

export const approveEvaluationQuery = async (evaluationId: number) => {
  return await executeSql(`
    UPDATE evaluations
    SET status = 'approved', approved_at = NOW()
    WHERE id = ${evaluationId}
    RETURNING id;
  `);
};

export const disapproveEvaluationQuery = async (evaluationId: number, reason: string) => {
  return await executeSql(`
    UPDATE evaluations
    SET status = 'disapproved', 
        disapproved_at = NOW(),
        disapproval_reason = ${sqlEscape.string(reason)}
    WHERE id = ${evaluationId}
    RETURNING id;
  `);
};

// Create bulk evaluations query
export const createBulkEvaluationsQuery = async (memberIds: number[], evaluationDate: string, coachId: number) => {
  const memberIdsStr = memberIds.join(',');
  return await executeSql(`
    WITH inserted_evaluations AS (
      INSERT INTO evaluations (member_id, status, nominated_at, evaluation_date, coach_id)
      SELECT id, 'pending', NOW(), ${sqlEscape.string(evaluationDate)}, ${coachId}
      FROM members
      WHERE id IN (${memberIdsStr})
      RETURNING id
    )
    SELECT COUNT(*) as count FROM inserted_evaluations
  `);
};

// For testing and development - creates a sample pending evaluation
export const createSampleEvaluationQuery = async (memberId: number, coachId: number) => {
  return await executeSql(`
    INSERT INTO evaluations (member_id, status, nominated_at, coach_id)
    VALUES (${memberId}, 'pending', NOW(), ${coachId})
    RETURNING id;
  `);
};

// Query to get evaluation by ID with member details
export const getEvaluationByIdQuery = async (evaluationId: number) => {
  return await executeSql(`
    SELECT e.*, m.name as member_name, m.member_id as member_code
    FROM evaluations e
    JOIN members m ON e.member_id = m.id
    WHERE e.id = ${evaluationId}
  `);
};

// Update database schema if evaluation_result column doesn't exist
export const ensureEvaluationResultColumnQuery = async () => {
  // Check if column exists first
  const columnCheck = await executeSql(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'evaluations'
    AND column_name = 'evaluation_result';
  `);
  
  if (columnCheck.rows.length === 0) {
    // Column doesn't exist, add it
    return await executeSql(`
      ALTER TABLE evaluations
      ADD COLUMN evaluation_result VARCHAR(20) CHECK (evaluation_result IN ('passed', 'not_ready')),
      ADD COLUMN updated_at TIMESTAMP;
    `);
  }
  
  return { success: true, message: 'Column already exists' };
};
