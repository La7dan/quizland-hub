import { executeSql } from '../apiService';

// Fetch all quizzes with question count
export const fetchAllQuizzes = async () => {
  return executeSql(`
    SELECT q.*, 
           COUNT(qq.id) as question_count
    FROM quizzes q
    LEFT JOIN questions qq ON q.id = qq.quiz_id
    GROUP BY q.id
    ORDER BY q.id;
  `, { isPublicQuery: true });
};

// Fetch quiz levels
export const fetchQuizLevels = async () => {
  return executeSql(`
    SELECT * FROM quiz_levels ORDER BY id;
  `, { isPublicQuery: true });
};

// Fetch quiz by ID
export const fetchQuizById = async (quizId: number) => {
  return executeSql(`
    SELECT * FROM quizzes WHERE id = ${quizId};
  `, { isPublicQuery: true });
};

// Fetch questions for a specific quiz
export const fetchQuestionsByQuizId = async (quizId: number) => {
  return executeSql(`
    SELECT q.*, 
           (SELECT COUNT(*) FROM answers WHERE question_id = q.id) as answer_count
    FROM questions q
    WHERE q.quiz_id = ${quizId}
    ORDER BY q.id;
  `, { isPublicQuery: true });
};

// Fetch answers for a specific question
export const fetchAnswersByQuestionId = async (questionId: number) => {
  return executeSql(`
    SELECT * FROM answers WHERE question_id = ${questionId} ORDER BY id;
  `, { isPublicQuery: true });
};

// Insert a new quiz
export const insertQuiz = async (
  levelId: number,
  title: string,
  description: string,
  passingPercentage: number,
  isVisible: boolean
) => {
  const query = `
    INSERT INTO quizzes (level_id, title, description, passing_percentage, is_visible)
    VALUES (${levelId}, '${title}', '${description}', ${passingPercentage}, ${isVisible})
    RETURNING *;
  `;
  return executeSql(query);
};

// Update an existing quiz
export const updateQuiz = async (
  id: number,
  levelId: number,
  title: string,
  description: string,
  passingPercentage: number,
  isVisible: boolean
) => {
  const query = `
    UPDATE quizzes
    SET level_id = ${levelId},
        title = '${title}',
        description = '${description}',
        passing_percentage = ${passingPercentage},
        is_visible = ${isVisible}
    WHERE id = ${id}
    RETURNING *;
  `;
  return executeSql(query);
};

// Delete a quiz
export const deleteQuiz = async (id: number) => {
  const query = `
    DELETE FROM quizzes
    WHERE id = ${id}
    RETURNING *;
  `;
  return executeSql(query);
};

// Insert a new question
export const insertQuestion = async (
  quizId: number,
  text: string,
  questionType: string,
  correctAnswerId: number | null
) => {
  const query = `
    INSERT INTO questions (quiz_id, text, question_type, correct_answer_id)
    VALUES (${quizId}, '${text}', '${questionType}', ${correctAnswerId === null ? null : correctAnswerId})
    RETURNING *;
  `;
  return executeSql(query);
};

// Update an existing question
export const updateQuestion = async (
  id: number,
  quizId: number,
  text: string,
  questionType: string,
  correctAnswerId: number | null
) => {
  const query = `
    UPDATE questions
    SET quiz_id = ${quizId},
        text = '${text}',
        question_type = '${questionType}',
        correct_answer_id = ${correctAnswerId === null ? null : correctAnswerId}
    WHERE id = ${id}
    RETURNING *;
  `;
  return executeSql(query);
};

// Delete a question
export const deleteQuestion = async (id: number) => {
  const query = `
    DELETE FROM questions
    WHERE id = ${id}
    RETURNING *;
  `;
  return executeSql(query);
};

// Insert a new answer
export const insertAnswer = async (
  questionId: number,
  text: string,
  isCorrect: boolean
) => {
  const query = `
    INSERT INTO answers (question_id, text, is_correct)
    VALUES (${questionId}, '${text}', ${isCorrect})
    RETURNING *;
  `;
  return executeSql(query);
};

// Update an existing answer
export const updateAnswer = async (
  id: number,
  questionId: number,
  text: string,
  isCorrect: boolean
) => {
  const query = `
    UPDATE answers
    SET question_id = ${questionId},
        text = '${text}',
        is_correct = ${isCorrect}
    WHERE id = ${id}
    RETURNING *;
  `;
  return executeSql(query);
};

// Delete an answer
export const deleteAnswer = async (id: number) => {
  const query = `
    DELETE FROM answers
    WHERE id = ${id}
    RETURNING *;
  `;
  return executeSql(query);
};

// Fetch quiz attempts for a specific quiz
export const fetchQuizAttemptsByQuizId = async (quizId: number) => {
    const query = `
      SELECT *
      FROM quiz_attempts
      WHERE quiz_id = ${quizId}
      ORDER BY id DESC;
    `;
    return executeSql(query);
};

// Insert a new quiz attempt
export const insertQuizAttempt = async (
    userId: number,
    quizId: number,
    score: number,
    percentage: number,
    passed: boolean
) => {
    const query = `
      INSERT INTO quiz_attempts (user_id, quiz_id, score, percentage, passed)
      VALUES (${userId}, ${quizId}, ${score}, ${percentage}, ${passed})
      RETURNING *;
    `;
    return executeSql(query);
};

// Update an existing quiz attempt (if needed)
export const updateQuizAttempt = async (
    id: number,
    userId: number,
    quizId: number,
    score: number,
    percentage: number,
    passed: boolean
) => {
    const query = `
      UPDATE quiz_attempts
      SET user_id = ${userId},
          quiz_id = ${quizId},
          score = ${score},
          percentage = ${percentage},
          passed = ${passed}
      WHERE id = ${id}
      RETURNING *;
    `;
    return executeSql(query);
};

// Delete a quiz attempt
export const deleteQuizAttempt = async (id: number) => {
    const query = `
      DELETE FROM quiz_attempts
      WHERE id = ${id}
      RETURNING *;
    `;
    return executeSql(query);
};
