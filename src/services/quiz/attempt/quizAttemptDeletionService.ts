
import { executeSql, sqlEscape } from '../../apiService';
import { ServiceResponse } from '../quizTypes';

/**
 * Delete a single quiz attempt by ID
 */
export const deleteQuizAttempt = async (attemptId: number): Promise<ServiceResponse> => {
  try {
    if (!attemptId) {
      return {
        success: false,
        message: 'Attempt ID is required'
      };
    }

    const result = await executeSql(`
      DELETE FROM quiz_attempts 
      WHERE id = ${sqlEscape.number(attemptId)}
      RETURNING id;
    `);
    
    if (result.success && result.rows && result.rows.length > 0) {
      return {
        success: true,
        message: 'Quiz attempt deleted successfully'
      };
    } else {
      return {
        success: false,
        message: 'Failed to delete quiz attempt or attempt not found'
      };
    }
  } catch (error) {
    console.error('Error in deleteQuizAttempt:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Delete multiple quiz attempts by IDs
 */
export const bulkDeleteQuizAttempts = async (attemptIds: number[]): Promise<ServiceResponse> => {
  try {
    if (!attemptIds || !attemptIds.length) {
      return {
        success: false,
        message: 'No attempt IDs provided'
      };
    }

    // Format IDs for SQL query
    const formattedIds = attemptIds.join(', ');

    const result = await executeSql(`
      DELETE FROM quiz_attempts 
      WHERE id IN (${formattedIds})
      RETURNING id;
    `);
    
    if (result.success) {
      return {
        success: true,
        message: `${result.rowCount || 0} quiz attempts deleted successfully`,
        count: result.rowCount || 0
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to delete quiz attempts'
      };
    }
  } catch (error) {
    console.error('Error in bulkDeleteQuizAttempts:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
