import { executeSql, sqlEscape } from '../apiService';
import { Evaluation } from './types';

export const fetchPendingEvaluationsQuery = async (coachId: number) => {
  console.log('Fetching pending evaluations for coach:', coachId);
  return await executeSql(`
    SELECT e.id, e.member_id, e.status, e.nominated_at, e.coach_id, e.evaluation_result,
           m.name as member_name, m.member_id as member_code, m.classes_count
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

export const createBulkEvaluationsQuery = async (memberIds: number[], evaluationDate: string, coachId: number) => {
  const memberIdsStr = memberIds.join(',');
  return await executeSql(`
    WITH eligible_members AS (
      SELECT id 
      FROM members
      WHERE id IN (${memberIdsStr})
      AND NOT EXISTS (
        SELECT 1 FROM evaluations 
        WHERE member_id = members.id 
        AND evaluation_date = ${sqlEscape.string(evaluationDate)}
      )
    ),
    inserted_evaluations AS (
      INSERT INTO evaluations (member_id, status, nominated_at, evaluation_date, coach_id)
      SELECT id, 'pending', NOW(), ${sqlEscape.string(evaluationDate)}, ${coachId}
      FROM eligible_members
      RETURNING id
    )
    SELECT COUNT(*) as count FROM inserted_evaluations
  `);
};

export const createSampleEvaluationQuery = async (memberId: number, coachId: number) => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  const checkResult = await executeSql(`
    SELECT COUNT(*) as count 
    FROM evaluations 
    WHERE member_id = ${memberId} AND evaluation_date = '${currentDate}'
  `);
  
  if (checkResult.rows[0].count > 0) {
    return {
      success: false,
      message: 'Member already has an evaluation for this date'
    };
  }
  
  return await executeSql(`
    INSERT INTO evaluations (member_id, status, nominated_at, coach_id, evaluation_date)
    VALUES (${memberId}, 'pending', NOW(), ${coachId}, '${currentDate}')
    RETURNING id;
  `);
};

export const getEvaluationByIdQuery = async (evaluationId: number) => {
  return await executeSql(`
    SELECT e.*, m.name as member_name, m.member_id as member_code
    FROM evaluations e
    JOIN members m ON e.member_id = m.id
    WHERE e.id = ${evaluationId}
  `);
};

export const ensureEvaluationResultColumnQuery = async () => {
  const columnCheck = await executeSql(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'evaluations'
    AND column_name = 'evaluation_result';
  `);
  
  if (columnCheck.rows.length === 0) {
    return await executeSql(`
      ALTER TABLE evaluations
      ADD COLUMN evaluation_result VARCHAR(20) CHECK (evaluation_result IN ('passed', 'not_ready')),
      ADD COLUMN updated_at TIMESTAMP;
    `);
  }
  
  return { success: true, message: 'Column already exists' };
};

export const updateEvaluationResultQuery = async (evaluationId: number, result: 'passed' | 'not_ready') => {
  return await executeSql(`
    UPDATE evaluations
    SET evaluation_result = ${sqlEscape.string(result)}, updated_at = NOW()
    WHERE id = ${evaluationId}
    RETURNING id;
  `);
};
