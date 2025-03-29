
import { executeSql, sqlEscape } from '../../apiService';
import { ServiceResponse, Question } from '../quizTypes';

// Function to get quiz questions with answers
export const getQuizQuestions = async (quizId: number): Promise<ServiceResponse<{ questions: Question[] }>> => {
  try {
    // First, get all questions for this quiz
    const questionsResult = await executeSql(`
      SELECT * FROM questions 
      WHERE quiz_id = ${sqlEscape.number(quizId)}
      AND is_visible = TRUE
      ORDER BY id;
    `, { isPublicQuery: true });
    
    if (!questionsResult.success) {
      return {
        success: false,
        message: questionsResult.message || 'Failed to fetch quiz questions'
      };
    }
    
    const questions = questionsResult.rows || [];
    
    // For each question, get its answers
    if (questions.length > 0) {
      // Get all answers for these questions in a single query to improve performance
      const questionIds = questions.map(q => q.id).join(',');
      
      const answersResult = await executeSql(`
        SELECT * FROM answers
        WHERE question_id IN (${questionIds})
        ORDER BY id;
      `, { isPublicQuery: true });
      
      if (answersResult.success) {
        // Group answers by question_id
        const answersMap = {};
        answersResult.rows?.forEach(answer => {
          if (!answersMap[answer.question_id]) {
            answersMap[answer.question_id] = [];
          }
          answersMap[answer.question_id].push(answer);
        });
        
        // Add answers to their respective questions
        questions.forEach(question => {
          question.answers = answersMap[question.id] || [];
        });
      }
    }
    
    return {
      success: true,
      questions: questions
    };
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
    `, { isPublicQuery: true });
    
    if (questionResult.success && questionResult.rows && questionResult.rows.length > 0) {
      // Get answers for this question
      const answersResult = await executeSql(`
        SELECT * FROM answers WHERE question_id = ${sqlEscape.number(id)} ORDER BY id;
      `, { isPublicQuery: true });
      
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
