
import { executeSql } from './dbService';

// Function to get all quizzes
export const getQuizzes = async () => {
  try {
    console.log('Fetching quizzes...');
    const result = await executeSql(`
      SELECT q.*, 
             COUNT(qq.id) as question_count
      FROM quizzes q
      LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
      GROUP BY q.id
      ORDER BY q.id;
    `);
    
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
export const getQuizLevels = async () => {
  try {
    const result = await executeSql(`
      SELECT * FROM quiz_levels ORDER BY id;
    `);
    
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

// Function to create a new quiz
export const createQuiz = async (quizData: any) => {
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
        '${quizData.title}', 
        '${quizData.description || ''}', 
        ${quizData.level_id !== null ? quizData.level_id : 'NULL'}, 
        ${quizData.passing_percentage || 70}, 
        ${quizData.is_visible !== undefined ? quizData.is_visible : true}
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
export const updateQuiz = async (quizData: any) => {
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
      SET title = '${quizData.title}',
          description = '${quizData.description || ''}',
          level_id = ${quizData.level_id !== null ? quizData.level_id : 'NULL'},
          passing_percentage = ${quizData.passing_percentage || 70},
          is_visible = ${quizData.is_visible !== undefined ? quizData.is_visible : true}
      WHERE id = ${quizData.id};
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
export const deleteQuiz = async (id: number) => {
  try {
    // Delete associated questions first
    await executeSql(`
      DELETE FROM quiz_questions
      WHERE quiz_id = ${id};
    `);
    
    // Then delete the quiz
    const result = await executeSql(`
      DELETE FROM quizzes
      WHERE id = ${id};
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

// Function to get quiz details by ID
export const getQuizById = async (id: number) => {
  try {
    const result = await executeSql(`
      SELECT q.*,
             COUNT(qq.id) as question_count
      FROM quizzes q
      LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
      WHERE q.id = ${id}
      GROUP BY q.id;
    `);
    
    if (result.success && result.rows && result.rows.length > 0) {
      return {
        success: true,
        quiz: result.rows[0]
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

// Function to get quiz questions
export const getQuizQuestions = async (quizId: number) => {
  try {
    const result = await executeSql(`
      SELECT * FROM quiz_questions 
      WHERE quiz_id = ${quizId}
      ORDER BY question_order;
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

// Function to save quiz attempt
export const saveQuizAttempt = async (attemptData: any) => {
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
        score,
        total_questions,
        passed,
        time_taken,
        completed_at
      )
      VALUES (
        ${attemptData.quiz_id},
        '${attemptData.member_id}',
        ${attemptData.score || 0},
        ${attemptData.total_questions || 0},
        ${attemptData.passed !== undefined ? attemptData.passed : false},
        ${attemptData.time_taken || 0},
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

// Function to get quiz attempts
export const getQuizAttempts = async () => {
  try {
    const result = await executeSql(`
      SELECT a.*, 
             q.title as quiz_title,
             m.name as member_name
      FROM quiz_attempts a
      JOIN quizzes q ON a.quiz_id = q.id
      JOIN members m ON a.member_id = m.member_id
      ORDER BY a.completed_at DESC;
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
export const deleteQuizAttempt = async (id: number) => {
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
