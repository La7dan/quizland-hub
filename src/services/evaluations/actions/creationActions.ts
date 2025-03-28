
import { EvaluationActionResponse } from '../types';
import { createBulkEvaluationsQuery, createSampleEvaluationQuery } from '../evaluationQueries';

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
    
    // If count is 0, it means all members already had evaluations for this date
    if (count === 0) {
      return {
        success: false,
        message: 'All selected members already have evaluations scheduled for this date'
      };
    }
    
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
