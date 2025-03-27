
import { executeSql } from './dbService';

// Get all quiz levels
export const getQuizLevels = async (): Promise<{ success: boolean; levels?: any[]; message?: string }> => {
  try {
    const result = await executeSql('SELECT * FROM quiz_levels ORDER BY id');
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return { success: true, levels: result.rows || [] };
  } catch (error) {
    console.error('Get quiz levels error:', error);
    return { success: false, levels: [], message: 'Failed to fetch quiz levels' };
  }
};

// Get all quizzes with question count
export const getQuizzes = async (): Promise<{ success: boolean; quizzes?: any[]; message?: string }> => {
  try {
    const result = await executeSql(`
      SELECT q.*, COUNT(qs.id) as question_count
      FROM quizzes q
      LEFT JOIN questions qs ON q.id = qs.quiz_id
      GROUP BY q.id
      ORDER BY q.created_at DESC
    `);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return { success: true, quizzes: result.rows || [] };
  } catch (error) {
    console.error('Get quizzes error:', error);
    return { success: false, quizzes: [], message: 'Failed to fetch quizzes' };
  }
};

// Get a single quiz by ID with questions and answers
export const getQuizById = async (quizId: number): Promise<{ success: boolean; quiz?: any; questions?: any[]; message?: string }> => {
  try {
    // Get quiz details
    const quizResult = await executeSql(`
      SELECT * FROM quizzes WHERE id = ${quizId}
    `);
    
    if (!quizResult.success || !quizResult.rows || quizResult.rows.length === 0) {
      throw new Error(quizResult.message || 'Quiz not found');
    }
    
    // Get quiz questions
    const questionsResult = await executeSql(`
      SELECT * FROM questions 
      WHERE quiz_id = ${quizId}
      ORDER BY id
    `);
    
    if (!questionsResult.success) {
      throw new Error(questionsResult.message || 'Failed to fetch questions');
    }
    
    // Get answers for all questions
    const questions = questionsResult.rows || [];
    const questionIds = questions.map(q => q.id);
    
    if (questionIds.length > 0) {
      const answersResult = await executeSql(`
        SELECT * FROM answers 
        WHERE question_id IN (${questionIds.join(',')})
        ORDER BY id
      `);
      
      if (answersResult.success && answersResult.rows) {
        // Attach answers to their questions
        questions.forEach(question => {
          question.answers = answersResult.rows.filter(answer => answer.question_id === question.id);
        });
      }
    }
    
    return { 
      success: true, 
      quiz: quizResult.rows[0],
      questions
    };
  } catch (error) {
    console.error('Get quiz by ID error:', error);
    return { success: false, message: `Failed to fetch quiz: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

// Create a new quiz
export const createQuiz = async (quiz: any): Promise<{ success: boolean; message: string; quizId?: number }> => {
  try {
    const { title, description, level_id, passing_percentage, is_visible } = quiz;
    
    const result = await executeSql(`
      INSERT INTO quizzes (title, description, level_id, passing_percentage, is_visible, created_by)
      VALUES ('${title}', '${description}', ${level_id}, ${passing_percentage}, ${is_visible}, 
        (SELECT id FROM users WHERE role = 'admin' LIMIT 1))
      RETURNING id;
    `);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    const quizId = result.rows && result.rows[0] ? result.rows[0].id : undefined;
    
    return { 
      success: true, 
      message: 'Quiz created successfully', 
      quizId 
    };
  } catch (error) {
    console.error('Create quiz error:', error);
    return { success: false, message: `Failed to create quiz: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

// Update an existing quiz
export const updateQuiz = async (quiz: any): Promise<{ success: boolean; message: string }> => {
  try {
    if (!quiz.id) {
      throw new Error('Quiz ID is required for update');
    }
    
    const { id, title, description, level_id, passing_percentage, is_visible } = quiz;
    
    const result = await executeSql(`
      UPDATE quizzes
      SET title = '${title}',
          description = '${description}',
          level_id = ${level_id},
          passing_percentage = ${passing_percentage},
          is_visible = ${is_visible}
      WHERE id = ${id};
    `);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return { success: true, message: 'Quiz updated successfully' };
  } catch (error) {
    console.error('Update quiz error:', error);
    return { success: false, message: `Failed to update quiz: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

// Create a new question for a quiz
export const createQuestion = async (question: any): Promise<{ success: boolean; message: string; questionId?: number }> => {
  try {
    const { quiz_id, question_text, question_type, points, is_visible } = question;
    
    const result = await executeSql(`
      INSERT INTO questions (quiz_id, question_text, question_type, points, is_visible)
      VALUES (${quiz_id}, '${question_text}', '${question_type}', ${points}, ${is_visible})
      RETURNING id;
    `);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    const questionId = result.rows && result.rows[0] ? result.rows[0].id : undefined;
    
    return { 
      success: true, 
      message: 'Question created successfully', 
      questionId 
    };
  } catch (error) {
    console.error('Create question error:', error);
    return { success: false, message: `Failed to create question: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

// Create a new quiz attempt
export const createQuizAttempt = async (attempt: any): Promise<{ success: boolean; message: string; attemptId?: number }> => {
  try {
    const { quiz_id, visitor_name, member_id, score, percentage, result } = attempt;
    
    const queryResult = await executeSql(`
      INSERT INTO quiz_attempts (quiz_id, visitor_name, member_id, score, percentage, result)
      VALUES (${quiz_id}, '${visitor_name}', '${member_id}', ${score}, ${percentage}, '${result}')
      RETURNING id;
    `);
    
    if (!queryResult.success) {
      throw new Error(queryResult.message);
    }
    
    const attemptId = queryResult.rows && queryResult.rows[0] ? queryResult.rows[0].id : undefined;
    
    return { 
      success: true, 
      message: 'Quiz attempt recorded successfully', 
      attemptId 
    };
  } catch (error) {
    console.error('Create quiz attempt error:', error);
    return { success: false, message: `Failed to record quiz attempt: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

// Get quiz attempts
export const getQuizAttempts = async (): Promise<{ success: boolean; attempts?: any[]; message?: string }> => {
  try {
    const result = await executeSql(`
      SELECT qa.*, q.title as quiz_title
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      ORDER BY qa.attempt_date DESC
    `);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return { success: true, attempts: result.rows || [] };
  } catch (error) {
    console.error('Get quiz attempts error:', error);
    return { success: false, attempts: [], message: 'Failed to fetch quiz attempts' };
  }
};
