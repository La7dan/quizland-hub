
import { executeSql } from '../apiService';
import { sqlEscape } from '../api/sqlService'; // Fixed import path for sqlEscape
import { ServiceResponse, Quiz } from './quizTypes';

// Function to create a new quiz
export const createQuiz = async (quizData: Partial<Quiz>): Promise<ServiceResponse<{ quiz_id: number }>> => {
  try {
    // Validate quiz data
    if (!quizData.title) {
      return {
        success: false,
        message: 'Quiz title is required'
      };
    }

    const result = await executeSql(`
      INSERT INTO quizzes (
        title, 
        description, 
        level_id, 
        passing_percentage, 
        is_visible
      )
      VALUES (
        ${sqlEscape.string(quizData.title)}, 
        ${sqlEscape.string(quizData.description || '')}, 
        ${sqlEscape.number(quizData.level_id)}, 
        ${sqlEscape.number(quizData.passing_percentage || 70)}, 
        ${sqlEscape.boolean(quizData.is_visible !== undefined ? quizData.is_visible : true)}
      )
      RETURNING id;
    `);

    if (result.success && result.rows && result.rows.length > 0) {
      return {
        success: true,
        quiz_id: result.rows[0].id
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to create quiz'
      };
    }
  } catch (error) {
    console.error('Error in createQuiz:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Function to update an existing quiz
export const updateQuiz = async (quizData: Partial<Quiz> & { id: number }): Promise<ServiceResponse> => {
  try {
    // Validate quiz data
    if (!quizData.id || !quizData.title) {
      return {
        success: false,
        message: 'Quiz ID and title are required'
      };
    }

    const result = await executeSql(`
      UPDATE quizzes
      SET title = ${sqlEscape.string(quizData.title)},
          description = ${sqlEscape.string(quizData.description || '')},
          level_id = ${sqlEscape.number(quizData.level_id)},
          passing_percentage = ${sqlEscape.number(quizData.passing_percentage || 70)},
          is_visible = ${sqlEscape.boolean(quizData.is_visible !== undefined ? quizData.is_visible : true)}
      WHERE id = ${sqlEscape.number(quizData.id)};
    `);

    if (result.success) {
      return {
        success: true
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to update quiz'
      };
    }
  } catch (error) {
    console.error('Error in updateQuiz:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Function to delete a quiz
export const deleteQuiz = async (id: number): Promise<ServiceResponse> => {
  try {
    // First delete associated quiz attempts
    await executeSql(`
      DELETE FROM quiz_attempts
      WHERE quiz_id = ${sqlEscape.number(id)};
    `);
    
    // Then delete associated answers
    await executeSql(`
      DELETE FROM answers
      WHERE question_id IN (
        SELECT id FROM questions WHERE quiz_id = ${sqlEscape.number(id)}
      );
    `);
    
    // Then delete the questions
    await executeSql(`
      DELETE FROM questions
      WHERE quiz_id = ${sqlEscape.number(id)};
    `);
    
    // Finally delete the quiz
    const result = await executeSql(`
      DELETE FROM quizzes
      WHERE id = ${sqlEscape.number(id)};
    `);

    if (result.success) {
      return {
        success: true
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to delete quiz'
      };
    }
  } catch (error) {
    console.error('Error in deleteQuiz:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
