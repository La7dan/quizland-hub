import { executeSql } from './dbService';

// Function to get all quizzes
export const getQuizzes = async () => {
  try {
    console.log('Fetching quizzes...');
    const result = await executeSql(`
      SELECT q.*, 
             COUNT(qq.id) as question_count
      FROM quizzes q
      LEFT JOIN questions qq ON q.id = qq.quiz_id
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
      DELETE FROM questions
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
    // Get quiz data
    const quizResult = await executeSql(`
      SELECT q.*,
             COUNT(qq.id) as question_count
      FROM quizzes q
      LEFT JOIN questions qq ON q.id = qq.quiz_id
      WHERE q.id = ${id}
      GROUP BY q.id;
    `);
    
    if (quizResult.success && quizResult.rows && quizResult.rows.length > 0) {
      // Get questions for this quiz
      const questionsResult = await executeSql(`
        SELECT qq.*, 
               json_agg(
                 json_build_object(
                   'id', qa.id,
                   'answer_text', qa.answer_text,
                   'is_correct', qa.is_correct
                 )
               ) as answers
        FROM questions qq
        LEFT JOIN answers qa ON qq.id = qa.question_id
        WHERE qq.quiz_id = ${id}
        GROUP BY qq.id
        ORDER BY qq.id;
      `);
      
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

// Function to get quiz questions
export const getQuizQuestions = async (quizId: number) => {
  try {
    const result = await executeSql(`
      SELECT * FROM questions 
      WHERE quiz_id = ${quizId}
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
        '${attemptData.passed ? "passed" : "not_ready"}'
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

// Function to delete multiple quiz attempts
export const bulkDeleteQuizAttempts = async (ids: number[]) => {
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

// New function to add a question to a quiz
export const addQuestion = async (questionData: any) => {
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
        ${questionData.quiz_id},
        '${questionData.question_text}',
        '${questionData.question_type}',
        ${questionData.is_visible !== undefined ? questionData.is_visible : true},
        ${questionData.points || 1}
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
              ${questionId},
              '${answer.answer_text}',
              ${answer.is_correct || false}
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
export const updateQuestion = async (questionData: any) => {
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
      SET question_text = '${questionData.question_text}',
          question_type = '${questionData.question_type}',
          is_visible = ${questionData.is_visible !== undefined ? questionData.is_visible : true},
          points = ${questionData.points || 1}
      WHERE id = ${questionData.id};
    `);

    if (result.success) {
      // If answers are provided, delete existing ones and insert new ones
      if (questionData.answers && Array.isArray(questionData.answers)) {
        // Delete existing answers
        await executeSql(`DELETE FROM answers WHERE question_id = ${questionData.id};`);
        
        // Insert new answers
        for (const answer of questionData.answers) {
          await executeSql(`
            INSERT INTO answers (
              question_id,
              answer_text,
              is_correct
            )
            VALUES (
              ${questionData.id},
              '${answer.answer_text}',
              ${answer.is_correct || false}
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

// Function to delete a question
export const deleteQuestion = async (id: number) => {
  try {
    // Delete associated answers first
    await executeSql(`DELETE FROM answers WHERE question_id = ${id};`);
    
    // Then delete the question
    const result = await executeSql(`DELETE FROM questions WHERE id = ${id};`);

    if (result.success) {
      return {
        success: true
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to delete question'
      };
    }
  } catch (error) {
    console.error('Error in deleteQuestion:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Function to get a specific question with its answers
export const getQuestionById = async (id: number) => {
  try {
    // Get question data
    const questionResult = await executeSql(`
      SELECT * FROM questions WHERE id = ${id};
    `);
    
    if (questionResult.success && questionResult.rows && questionResult.rows.length > 0) {
      // Get answers for this question
      const answersResult = await executeSql(`
        SELECT * FROM answers WHERE question_id = ${id} ORDER BY id;
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
