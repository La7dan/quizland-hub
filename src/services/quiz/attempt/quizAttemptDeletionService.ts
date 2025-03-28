
import { executeSql, sqlEscape } from '../../apiService';
import { ServiceResponse } from '../quizTypes';

// Function to delete a quiz attempt
export const deleteQuizAttempt = async (id: number): Promise<ServiceResponse> => {
  try {
    const result = await executeSql(`
      DELETE FROM quiz_attempts
      WHERE id = ${sqlEscape.number(id)};
    `);

    if (result.success) {
      return {
        success: true,
        message: 'Quiz attempt deleted successfully'
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to delete quiz attempt'
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

// Function to bulk delete quiz attempts
export const bulkDeleteQuizAttempts = async (ids: number[]): Promise<ServiceResponse> => {
  try {
    if (!ids.length) {
      return {
        success: false,
        message: 'No attempt IDs provided'
      };
    }

    const idList = ids.map(id => sqlEscape.number(id)).join(',');
    
    const result = await executeSql(`
      DELETE FROM quiz_attempts
      WHERE id IN (${idList});
    `);

    if (result.success) {
      return {
        success: true,
        message: `${ids.length} quiz attempts deleted successfully`
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
