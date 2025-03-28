
import { EvaluationActionResponse } from '../types';
import { approveEvaluationQuery, disapproveEvaluationQuery } from '../evaluationQueries';

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
