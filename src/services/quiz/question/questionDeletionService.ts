
import { executeSql, sqlEscape } from '../../apiService';
import { ServiceResponse } from '../quizTypes';

// Function to delete a question
export const deleteQuestion = async (id: number): Promise<ServiceResponse> => {
  try {
    // Delete associated answers first
    await executeSql(`DELETE FROM answers WHERE question_id = ${sqlEscape.number(id)};`);
    
    // Then delete the question
    const result = await executeSql(`DELETE FROM questions WHERE id = ${sqlEscape.number(id)};`);

    if (result.success) {
      return {
        success: true
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to delete question'
      };
    }
  } catch (error) {
    console.error('Error in deleteQuestion:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
