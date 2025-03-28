
import { EvaluationResponse } from '../types';
import { fetchPendingEvaluationsQuery } from '../evaluationQueries';

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
