import { Evaluation, EvaluationResponse, EvaluationActionResponse } from './types';
import { 
  fetchPendingEvaluationsQuery, 
  approveEvaluationQuery, 
  disapproveEvaluationQuery,
  createSampleEvaluationQuery,
  createBulkEvaluationsQuery
} from './evaluationQueries';
import { executeSql, sqlEscape } from '../apiService';

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
    
    const result = await createBulkEvaluationsQuery(memberIds, evaluationDate, coachId);
    
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

export const updateEvaluationResult = async (
  evaluationId: number,
  result: 'passed' | 'not_ready',
  pdfFileName: string | null
): Promise<EvaluationActionResponse> => {
  try {
    if (result === 'not_ready' && !pdfFileName) {
      return {
        success: false,
        message: 'PDF is required for "Not Ready" evaluations'
      };
    }

    const query = `
      UPDATE evaluations
      SET 
        status = 'approved',
        evaluation_result = ${sqlEscape.string(result)},
        evaluation_pdf = ${pdfFileName ? sqlEscape.string(pdfFileName) : 'evaluation_pdf'},
        updated_at = NOW()
      WHERE id = ${evaluationId}
      RETURNING id;
    `;
    
    const queryResult = await executeSql(query);
    
    if (!queryResult.success) {
      throw new Error(queryResult.message);
    }
    
    return {
      success: true,
      id: queryResult.rows[0]?.id,
      message: `Evaluation marked as ${result} successfully`
    };
  } catch (error) {
    console.error('Error updating evaluation result:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update evaluation'
    };
  }
};

export const bulkMarkEvaluationsAsPassed = async (
  evaluationIds: number[]
): Promise<EvaluationActionResponse> => {
  try {
    if (!evaluationIds.length) {
      return {
        success: false,
        message: 'No evaluations selected'
      };
    }

    const query = `
      UPDATE evaluations
      SET 
        status = 'approved',
        evaluation_result = 'passed',
        updated_at = NOW()
      WHERE id IN (${evaluationIds.join(',')})
      RETURNING id;
    `;
    
    const queryResult = await executeSql(query);
    
    if (!queryResult.success) {
      throw new Error(queryResult.message);
    }
    
    return {
      success: true,
      message: `${queryResult.rowCount} evaluations marked as passed successfully`
    };
  } catch (error) {
    console.error('Error bulk marking evaluations as passed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update evaluations'
    };
  }
};
