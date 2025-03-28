
import { executeSql, sqlEscape } from '../../apiService';
import { ServiceResponse } from '../quizTypes';

// Function to add a question to a quiz
export const addQuestion = async (questionData: any): Promise<ServiceResponse<{ question_id: number }>> => {
  try {
    // Validate question data
    if (!questionData.quiz_id || !questionData.question_text || !questionData.question_type) {
      return {
        success: false,
        message: 'Quiz ID, question text, and question type are required'
      };
    }

    // Insert the question
    const result = await executeSql(`
      INSERT INTO questions (
        quiz_id,
        question_text,
        question_type,
        is_visible,
        points
      )
      VALUES (
        ${sqlEscape.number(questionData.quiz_id)},
        ${sqlEscape.string(questionData.question_text)},
        ${sqlEscape.string(questionData.question_type)},
        ${sqlEscape.boolean(questionData.is_visible !== undefined ? questionData.is_visible : true)},
        ${sqlEscape.number(questionData.points || 1)}
      )
      RETURNING id;
    `);

    if (result.success && result.rows && result.rows.length > 0) {
      const questionId = result.rows[0].id;
      
      // If answers are provided, insert them
      if (questionData.answers && Array.isArray(questionData.answers) && questionData.answers.length > 0) {
        for (const answer of questionData.answers) {
          await executeSql(`
            INSERT INTO answers (
              question_id,
              answer_text,
              is_correct
            )
            VALUES (
              ${sqlEscape.number(questionId)},
              ${sqlEscape.string(answer.answer_text)},
              ${sqlEscape.boolean(answer.is_correct || false)}
            );
          `);
        }
      }
      
      return {
        success: true,
        question_id: questionId
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to add question'
      };
    }
  } catch (error) {
    console.error('Error in addQuestion:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Function to update a question
export const updateQuestion = async (questionData: any): Promise<ServiceResponse> => {
  try {
    // Validate question data
    if (!questionData.id || !questionData.question_text || !questionData.question_type) {
      return {
        success: false,
        message: 'Question ID, text, and type are required'
      };
    }

    // Update the question
    const result = await executeSql(`
      UPDATE questions
      SET question_text = ${sqlEscape.string(questionData.question_text)},
          question_type = ${sqlEscape.string(questionData.question_type)},
          is_visible = ${sqlEscape.boolean(questionData.is_visible !== undefined ? questionData.is_visible : true)},
          points = ${sqlEscape.number(questionData.points || 1)}
      WHERE id = ${sqlEscape.number(questionData.id)};
    `);

    if (result.success) {
      // If answers are provided, delete existing ones and insert new ones
      if (questionData.answers && Array.isArray(questionData.answers)) {
        // Delete existing answers
        await executeSql(`DELETE FROM answers WHERE question_id = ${sqlEscape.number(questionData.id)};`);
        
        // Insert new answers
        for (const answer of questionData.answers) {
          await executeSql(`
            INSERT INTO answers (
              question_id,
              answer_text,
              is_correct
            )
            VALUES (
              ${sqlEscape.number(questionData.id)},
              ${sqlEscape.string(answer.answer_text)},
              ${sqlEscape.boolean(answer.is_correct || false)}
            );
          `);
        }
      }
      
      return {
        success: true
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to update question'
      };
    }
  } catch (error) {
    console.error('Error in updateQuestion:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
