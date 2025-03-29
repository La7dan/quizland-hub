import { executeSql, sqlEscape } from '../apiService';
import { QuizAttempt, ServiceResponse } from './quizTypes';

// Function to save a quiz attempt
export const saveQuizAttempt = async (attemptData: Partial<QuizAttempt>): Promise<ServiceResponse> => {
  try {
    // Validate required fields
    if (!attemptData.quiz_id || !attemptData.member_id) {
      return {
        success: false,
        message: 'Quiz ID and member ID are required'
      };
    }

    console.log('Saving quiz attempt:', attemptData);

    // Modified to use isPublicQuery: true to allow unauthenticated access
    const result = await executeSql(`
      INSERT INTO quiz_attempts (
        quiz_id,
        visitor_name,
        member_id,
        score,
        percentage,
        result,
        attempt_date
      )
      VALUES (
        ${sqlEscape.number(attemptData.quiz_id)},
        ${sqlEscape.string(attemptData.visitor_name || '')},
        ${sqlEscape.string(attemptData.member_id)},
        ${sqlEscape.number(attemptData.score || 0)},
        ${sqlEscape.number(attemptData.percentage || 0)},
        ${sqlEscape.string(attemptData.result || 'not_ready')},
        NOW()
      )
      RETURNING id;
    `, { isPublicQuery: true }); // Set isPublicQuery to true

    console.log('Save quiz attempt result:', result);

    if (result.success && result.rows && result.rows.length > 0) {
      return {
        success: true,
        attempt_id: result.rows[0].id
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to save quiz attempt'
      };
    }
  } catch (error) {
    console.error('Error in saveQuizAttempt:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Re-export all quiz-attempt-related services from the attempt directory
export * from './attempt';
