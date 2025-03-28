
import { executeSql } from '../apiService';
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
        disapproval_reason = '${reason}'
    WHERE id = ${evaluationId}
    RETURNING id;
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
