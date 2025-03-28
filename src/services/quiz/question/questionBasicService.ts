
import { executeSql, sqlEscape } from '../../apiService';
import { ServiceResponse, Question } from '../quizTypes';

// Function to get quiz questions
export const getQuizQuestions = async (quizId: number): Promise<ServiceResponse<{ questions: Question[] }>> => {
  try {
    const result = await executeSql(`
      SELECT * FROM questions 
      WHERE quiz_id = ${sqlEscape.number(quizId)}
      ORDER BY id;
    `);
    
    if (result.success) {
      return {
        success: true,
        questions: result.rows || []
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to fetch quiz questions'
      };
    }
  } catch (error) {
    console.error('Error in getQuizQuestions:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Function to get a specific question with its answers
export const getQuestionById = async (id: number): Promise<ServiceResponse<{ question: Question, answers: any[] }>> => {
  try {
    // Get question data
    const questionResult = await executeSql(`
      SELECT * FROM questions WHERE id = ${sqlEscape.number(id)};
    `);
    
    if (questionResult.success && questionResult.rows && questionResult.rows.length > 0) {
      // Get answers for this question
      const answersResult = await executeSql(`
        SELECT * FROM answers WHERE question_id = ${sqlEscape.number(id)} ORDER BY id;
      `);
      
      return {
        success: true,
        question: questionResult.rows[0],
        answers: answersResult.success ? answersResult.rows || [] : []
      };
    } else {
      return {
        success: false,
        message: 'Question not found'
      };
    }
  } catch (error) {
    console.error('Error in getQuestionById:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
