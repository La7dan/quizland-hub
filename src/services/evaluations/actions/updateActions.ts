
import { EvaluationActionResponse } from '../types';
import { executeSql, sqlEscape } from '../../apiService';

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

    // When marking as passed, set status to approved (completed)
    const status = result === 'passed' ? 'approved' : 'approved';

    const query = `
      UPDATE evaluations
      SET 
        status = ${sqlEscape.string(status)},
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

    // When bulk marking as passed, also set status to approved (completed)
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
