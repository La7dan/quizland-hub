
// Common type definitions for quiz-related data
export interface Quiz {
  id: number;
  title: string;
  description?: string;
  level_id?: number;
  passing_percentage: number;
  is_visible: boolean;
  question_count?: number;
}

export interface Question {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  is_visible: boolean;
  points: number;
}

export interface Answer {
  id: number;
  question_id: number;
  answer_text: string;
  is_correct: boolean;
}

export interface QuizAttempt {
  id?: number;
  quiz_id: number;
  member_id: string;
  visitor_name?: string;
  score: number;
  percentage: number;
  result: 'passed' | 'not_ready';
  attempt_date?: string;
  total_questions?: number;
  passed?: boolean;
  time_taken?: number;
  quiz_title?: string;
  member_name?: string;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  message?: string;
  [key: string]: any;
}
