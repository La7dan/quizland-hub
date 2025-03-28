
import { executeSql, sqlEscape } from '../../apiService';
import { QuizAttempt, ServiceResponse } from '../quizTypes';

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

    // Insert the attempt
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

// Function to get quiz attempts by member
export const getQuizAttemptsByMember = async (memberId: string): Promise<ServiceResponse<{ attempts: QuizAttempt[] }>> => {
  try {
    const result = await executeSql(`
      SELECT a.*, q.title as quiz_title
      FROM quiz_attempts a
      JOIN quizzes q ON a.quiz_id = q.id
      WHERE a.member_id = ${sqlEscape.string(memberId)}
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
    console.error('Error in getQuizAttemptsByMember:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Function to get quiz attempts by quiz
export const getQuizAttemptsByQuiz = async (quizId: number): Promise<ServiceResponse<{ attempts: QuizAttempt[] }>> => {
  try {
    const result = await executeSql(`
      SELECT a.*
      FROM quiz_attempts a
      WHERE a.quiz_id = ${sqlEscape.number(quizId)}
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
    console.error('Error in getQuizAttemptsByQuiz:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Function to get all quiz attempts
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
