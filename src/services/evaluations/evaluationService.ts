
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
