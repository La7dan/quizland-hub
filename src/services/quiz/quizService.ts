
import { executeSql } from '../apiService';
import * as quizQueries from './quizQueries';
import { ServiceResponse, Quiz, Question, Answer, QuizAttempt } from './quizTypes';

// Function to get all quizzes
export const getQuizzes = async (): Promise<ServiceResponse<{ quizzes: Quiz[] }>> => {
  try {
    console.log('Fetching quizzes...');
    const result = await quizQueries.fetchAllQuizzes();
    
    if (result.success) {
      console.log(`Found ${result.rows?.length || 0} quizzes`);
      return {
        success: true,
        quizzes: result.rows || []
      };
    } else {
      console.error('Failed to fetch quizzes:', result.message);
      return {
        success: false,
        message: result.message || 'Failed to fetch quizzes'
      };
    }
  } catch (error) {
    console.error('Error in getQuizzes:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Function to get quiz levels
export const getQuizLevels = async (): Promise<ServiceResponse<{ levels: any[] }>> => {
  try {
    const result = await quizQueries.fetchQuizLevels();
    
    if (result.success) {
      return {
        success: true,
        levels: result.rows || []
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to fetch quiz levels'
      };
    }
  } catch (error) {
    console.error('Error in getQuizLevels:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Function to get quiz details by ID
export const getQuizById = async (id: number): Promise<ServiceResponse<{ quiz: Quiz, questions: Question[] }>> => {
  try {
    // Get quiz data
    const quizResult = await quizQueries.fetchQuizById(id);
    
    if (quizResult.success && quizResult.rows && quizResult.rows.length > 0) {
      // Get questions for this quiz
      const questionsResult = await quizQueries.fetchQuestionsByQuizId(id);
      
      return {
        success: true,
        quiz: quizResult.rows[0],
        questions: questionsResult.success ? questionsResult.rows || [] : []
      };
    } else {
      return {
        success: false,
        message: 'Quiz not found'
      };
    }
  } catch (error) {
    console.error('Error in getQuizById:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
