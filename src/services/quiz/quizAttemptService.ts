
import { executeSql } from '../apiService';
import { ServiceResponse, QuizAttempt } from './quizTypes';

// Function to save quiz attempt
export const saveQuizAttempt = async (attemptData: Partial<QuizAttempt>): Promise<ServiceResponse<{ attempt_id: number }>> => {
  try {
    // Validate attempt data
    if (!attemptData.quiz_id || !attemptData.member_id) {
      return {
        success: false,
        message: 'Quiz ID and member ID are required'
      };
    }

    const result = await executeSql(`
      INSERT INTO quiz_attempts (
        quiz_id,
        member_id,
        visitor_name,
        score,
        percentage,
        result
      )
      VALUES (
        ${attemptData.quiz_id},
        '${attemptData.member_id}',
        '${attemptData.visitor_name || "Unknown"}',
        ${attemptData.score || 0},
        ${attemptData.percentage || 0},
        '${attemptData.result || "not_ready"}'
      )
      RETURNING id;
    `);

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

// Function to get quiz attempts
export const getQuizAttempts = async (): Promise<ServiceResponse<{ attempts: QuizAttempt[] }>> => {
  try {
    const result = await executeSql(`
      SELECT a.*, 
             q.title as quiz_title,
             m.name as member_name
      FROM quiz_attempts a
      JOIN quizzes q ON a.quiz_id = q.id
      JOIN members m ON a.member_id = m.member_id
      ORDER BY a.attempt_date DESC;
    `);
    
    if (result.success) {
      return {
        success: true,
        attempts: result.rows || []
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to fetch quiz attempts'
      };
    }
  } catch (error) {
    console.error('Error in getQuizAttempts:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Function to delete a quiz attempt
export const deleteQuizAttempt = async (id: number): Promise<ServiceResponse> => {
  try {
    const result = await executeSql(`
      DELETE FROM quiz_attempts
      WHERE id = ${id};
    `);

    if (result.success) {
      return {
        success: true
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
export const bulkDeleteQuizAttempts = async (ids: number[]): Promise<ServiceResponse<{ count: number }>> => {
  try {
    if (!ids.length) {
      return {
        success: false,
        message: 'No attempts selected for deletion'
      };
    }

    // Convert array to comma-separated string for SQL IN clause
    const idList = ids.join(',');
    
    const result = await executeSql(`
      DELETE FROM quiz_attempts
      WHERE id IN (${idList});
    `);

    if (result.success) {
      return {
        success: true,
        count: ids.length
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
