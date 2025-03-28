
import { executeSql } from '../apiService';

// Basic quiz retrieval queries
export const fetchAllQuizzes = async () => {
  return await executeSql(`
    SELECT q.*, 
           COUNT(qq.id) as question_count
    FROM quizzes q
    LEFT JOIN questions qq ON q.id = qq.quiz_id
    GROUP BY q.id
    ORDER BY q.id;
  `);
};

export const fetchQuizById = async (id: number) => {
  return await executeSql(`
    SELECT q.*,
           COUNT(qq.id) as question_count
    FROM quizzes q
    LEFT JOIN questions qq ON q.id = qq.quiz_id
    WHERE q.id = ${id}
    GROUP BY q.id;
  `);
};

export const fetchQuizLevels = async () => {
  return await executeSql(`
    SELECT * FROM quiz_levels ORDER BY id;
  `);
};

// Question-related queries
export const fetchQuestionsByQuizId = async (quizId: number) => {
  return await executeSql(`
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
    WHERE qq.quiz_id = ${quizId}
    GROUP BY qq.id
    ORDER BY qq.id;
  `);
};

export const fetchQuestionById = async (id: number) => {
  return await executeSql(`
    SELECT * FROM questions WHERE id = ${id};
  `);
};

export const fetchAnswersByQuestionId = async (questionId: number) => {
  return await executeSql(`
    SELECT * FROM answers WHERE question_id = ${questionId} ORDER BY id;
  `);
};

// Quiz attempts queries
export const fetchAllQuizAttempts = async () => {
  return await executeSql(`
    SELECT a.*, 
           q.title as quiz_title,
           m.name as member_name
    FROM quiz_attempts a
    JOIN quizzes q ON a.quiz_id = q.id
    JOIN members m ON a.member_id = m.member_id
    ORDER BY a.attempt_date DESC;
  `);
};
