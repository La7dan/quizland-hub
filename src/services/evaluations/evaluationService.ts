
import { Evaluation, EvaluationResponse, EvaluationActionResponse } from './types';
import { 
  fetchPendingEvaluationsQuery, 
  approveEvaluationQuery, 
  disapproveEvaluationQuery,
  createSampleEvaluationQuery
} from './evaluationQueries';

export const fetchPendingEvaluations = async (coachId: number): Promise<EvaluationResponse> => {
  try {
    const result = await fetchPendingEvaluationsQuery(coachId);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return {
      success: true,
      evaluations: result.rows || []
    };
  } catch (error) {
    console.error('Error fetching pending evaluations:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch evaluations'
    };
  }
};

export const approveEvaluation = async (evaluationId: number): Promise<EvaluationActionResponse> => {
  try {
    const result = await approveEvaluationQuery(evaluationId);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return {
      success: true,
      id: result.rows && result.rows[0] ? result.rows[0].id : undefined,
      message: 'Evaluation approved successfully'
    };
  } catch (error) {
    console.error('Error approving evaluation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to approve evaluation'
    };
  }
};

export const disapproveEvaluation = async (evaluationId: number, reason: string): Promise<EvaluationActionResponse> => {
  try {
    if (!reason.trim()) {
      return {
        success: false,
        message: 'Disapproval reason is required'
      };
    }
    
    const result = await disapproveEvaluationQuery(evaluationId, reason);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return {
      success: true,
      id: result.rows && result.rows[0] ? result.rows[0].id : undefined,
      message: 'Evaluation disapproved successfully'
    };
  } catch (error) {
    console.error('Error disapproving evaluation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to disapprove evaluation'
    };
  }
};

// Create bulk evaluations
export const createBulkEvaluations = async (
  memberIds: number[], 
  evaluationDate: string, 
  coachId: number
): Promise<EvaluationActionResponse> => {
  try {
    if (!memberIds.length) {
      return {
        success: false,
        message: 'No members selected'
      };
    }
    
    if (!evaluationDate) {
      return {
        success: false,
        message: 'Evaluation date is required'
      };
    }
    
    console.log(`Creating ${memberIds.length} evaluations for coach ${coachId} on ${evaluationDate}`);
    
    // Create SQL to insert multiple evaluations
    const memberIdsStr = memberIds.join(',');
    const result = await executeSql(`
      WITH inserted_evaluations AS (
        INSERT INTO evaluations (member_id, status, nominated_at, evaluation_date, coach_id)
        SELECT id, 'pending', NOW(), '${evaluationDate}', ${coachId}
        FROM members
        WHERE id IN (${memberIdsStr})
        RETURNING id
      )
      SELECT COUNT(*) as count FROM inserted_evaluations
    `);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    const count = result.rows[0]?.count || 0;
    return {
      success: true,
      message: `Created ${count} pending evaluations successfully`
    };
  } catch (error) {
    console.error('Error creating bulk evaluations:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create evaluations'
    };
  }
};

// For testing and development - creates a sample pending evaluation
export const createSampleEvaluation = async (memberId: number, coachId: number): Promise<EvaluationActionResponse> => {
  try {
    const result = await createSampleEvaluationQuery(memberId, coachId);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return {
      success: true,
      id: result.rows && result.rows[0] ? result.rows[0].id : undefined,
      message: 'Sample evaluation created successfully'
    };
  } catch (error) {
    console.error('Error creating sample evaluation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create sample evaluation'
    };
  }
};
