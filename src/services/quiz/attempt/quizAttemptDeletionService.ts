
import { executeSql, sqlEscape } from '../../apiService';
import { ServiceResponse } from '../quizTypes';

// Function to delete a quiz attempt by ID
export const deleteQuizAttempt = async (id: number): Promise<ServiceResponse> => {
  try {
    console.log('Deleting quiz attempt:', id);
    const result = await executeSql(`
      DELETE FROM quiz_attempts
      WHERE id = ${sqlEscape.number(id)}
      RETURNING id;
    `, { isPublicQuery: true });
    
    console.log('Delete quiz attempt result:', result);
    
    if (result.success && result.rows && result.rows.length > 0) {
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

// Function to delete multiple quiz attempts
export const bulkDeleteQuizAttempts = async (ids: number[]): Promise<ServiceResponse> => {
  try {
    if (!ids || ids.length === 0) {
      return {
        success: false,
        message: 'No attempt IDs provided for deletion'
      };
    }
    
    console.log('Deleting multiple quiz attempts:', ids);
    
    // Convert array to SQL-friendly format
    const idList = ids.map(id => sqlEscape.number(id)).join(', ');
    
    const result = await executeSql(`
      DELETE FROM quiz_attempts
      WHERE id IN (${idList})
      RETURNING id;
    `, { isPublicQuery: true });
    
    console.log('Bulk delete quiz attempts result:', result);
    
    if (result.success) {
      return {
        success: true,
        count: result.rows ? result.rows.length : 0,
        message: `${result.rows ? result.rows.length : 0} quiz attempts deleted successfully`
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
