import { executeSql } from './apiService';

/**
 * Cleans dummy data from the database while preserving real members
 */
export const cleanDummyData = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Cleaning dummy data from database...');
    
    // Delete quiz attempts
    const deleteAttemptsResult = await executeSql(`DELETE FROM quiz_attempts;`);
    if (!deleteAttemptsResult.success) {
      return { 
        success: false, 
        message: 'Failed to delete quiz attempts: ' + deleteAttemptsResult.message 
      };
    }
    
    // Delete answers
    const deleteAnswersResult = await executeSql(`DELETE FROM answers;`);
    if (!deleteAnswersResult.success) {
      return { 
        success: false, 
        message: 'Failed to delete answers: ' + deleteAnswersResult.message 
      };
    }
    
    // Delete questions
    const deleteQuestionsResult = await executeSql(`DELETE FROM questions;`);
    if (!deleteQuestionsResult.success) {
      return { 
        success: false, 
        message: 'Failed to delete questions: ' + deleteQuestionsResult.message 
      };
    }
    
    // Delete quizzes
    const deleteQuizzesResult = await executeSql(`DELETE FROM quizzes;`);
    if (!deleteQuizzesResult.success) {
      return { 
        success: false, 
        message: 'Failed to delete quizzes: ' + deleteQuizzesResult.message 
      };
    }

    // Note: We're not deleting the sample members as per the request
    // to keep only the members in the database
    
    console.log('Successfully cleaned dummy data');
    
    return {
      success: true,
      message: 'Successfully removed all dummy quizzes, questions, and related data'
    };
  } catch (error) {
    console.error('Error in cleanDummyData:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
