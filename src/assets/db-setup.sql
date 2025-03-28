
-- Create users table with roles (super_admin, admin, coach)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'admin', 'coach')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create quiz levels table
CREATE TABLE IF NOT EXISTS quiz_levels (
  id SERIAL PRIMARY KEY,
  code VARCHAR(5) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create quizzes table with visibility setting and passing percentage
CREATE TABLE IF NOT EXISTS quizzes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  level_id INTEGER REFERENCES quiz_levels(id),
  course_id INTEGER REFERENCES courses(id),
  is_visible BOOLEAN DEFAULT TRUE,
  passing_percentage INTEGER DEFAULT 70,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create questions table with visibility setting
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  quiz_id INTEGER REFERENCES quizzes(id),
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  is_visible BOOLEAN DEFAULT TRUE,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id),
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create quiz attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id),
  visitor_name VARCHAR(100) NOT NULL,
  member_id VARCHAR(20) NOT NULL,
  score INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  result VARCHAR(20) NOT NULL CHECK (result IN ('passed', 'not_ready')),
  attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a view for quiz statistics
CREATE OR REPLACE VIEW quiz_stats AS
SELECT 
  q.id AS quiz_id,
  q.title AS quiz_title,
  COUNT(qn.id) AS total_questions,
  SUM(qn.points) AS total_points
FROM quizzes q
LEFT JOIN questions qn ON q.id = qn.quiz_id
GROUP BY q.id, q.title;

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  member_id VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  level_id INTEGER REFERENCES quiz_levels(id),
  classes_count INTEGER DEFAULT 0,
  coach_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'disapproved')),
  nominated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  disapproved_at TIMESTAMP,
  disapproval_reason TEXT,
  coach_id INTEGER REFERENCES users(id),
  evaluation_date TIMESTAMP,
  evaluation_pdf TEXT
);

-- Insert quiz levels
INSERT INTO quiz_levels (code, name, description)
VALUES 
  ('NC', 'New Comer', 'Entry level for complete beginners'),
  ('B1', 'Beginner 1', 'First step in beginner level'),
  ('B2', 'Beginner 2', 'Second step in beginner level'),
  ('B3', 'Beginner 3', 'Third step in beginner level'),
  ('I1', 'Intermediate 1', 'First step in intermediate level'),
  ('I2', 'Intermediate 2', 'Second step in intermediate level'),
  ('I3', 'Intermediate 3', 'Third step in intermediate level'),
  ('A1', 'Advanced 1', 'First step in advanced level'),
  ('A2', 'Advanced 2', 'Second step in advanced level'),
  ('A3', 'Advanced 3', 'Third step in advanced level')
ON CONFLICT (code) DO NOTHING;

-- Insert default super admin user if none exists
INSERT INTO users (username, password, email, role)
SELECT 'admin', 'admin123', 'admin@example.com', 'super_admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'super_admin')
ON CONFLICT DO NOTHING;

-- Insert sample members
INSERT INTO members (member_id, name, level_id, classes_count, coach_id)
VALUES 
  ('SH123456', 'John Smith', (SELECT id FROM quiz_levels WHERE code = 'B1'), 5, NULL),
  ('SH789012', 'Jane Doe', (SELECT id FROM quiz_levels WHERE code = 'I2'), 12, NULL),
  ('SH345678', 'Mike Johnson', (SELECT id FROM quiz_levels WHERE code = 'A1'), 20, NULL),
  ('SH901234', 'Sarah Williams', (SELECT id FROM quiz_levels WHERE code = 'NC'), 2, NULL),
  ('SH567890', 'David Brown', (SELECT id FROM quiz_levels WHERE code = 'B3'), 8, NULL)
ON CONFLICT (member_id) DO NOTHING;

-- Insert sample quiz
INSERT INTO quizzes (title, description, level_id, is_visible, passing_percentage, created_by)
VALUES ('Basic Grammar Quiz', 'Test your knowledge of basic grammar rules', 
        (SELECT id FROM quiz_levels WHERE code = 'B1'), TRUE, 70, 
        (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insert sample questions
INSERT INTO questions (question_text, quiz_id, question_type, is_visible, points)
VALUES ('What is the past tense of "go"?', 
        (SELECT id FROM quizzes WHERE title = 'Basic Grammar Quiz' LIMIT 1), 
        'multiple_choice', TRUE, 2)
ON CONFLICT DO NOTHING;

-- Insert sample answers
INSERT INTO answers (question_id, answer_text, is_correct)
VALUES 
  ((SELECT id FROM questions WHERE question_text = 'What is the past tense of "go"?' LIMIT 1), 'goed', FALSE),
  ((SELECT id FROM questions WHERE question_text = 'What is the past tense of "go"?' LIMIT 1), 'went', TRUE),
  ((SELECT id FROM questions WHERE question_text = 'What is the past tense of "go"?' LIMIT 1), 'gone', FALSE),
  ((SELECT id FROM questions WHERE question_text = 'What is the past tense of "go"?' LIMIT 1), 'going', FALSE)
ON CONFLICT DO NOTHING;

-- Insert sample quiz attempt
INSERT INTO quiz_attempts (quiz_id, visitor_name, member_id, score, percentage, result)
VALUES (
  (SELECT id FROM quizzes WHERE title = 'Basic Grammar Quiz' LIMIT 1),
  'John Smith',
  'SH123456',
  8,
  80.00,
  'passed'
)
ON CONFLICT DO NOTHING;

-- Insert sample evaluations
INSERT INTO evaluations (member_id, status, coach_id, evaluation_date)
VALUES 
  ((SELECT id FROM members WHERE member_id = 'SH123456'), 'pending', 
   (SELECT id FROM users WHERE role = 'coach' LIMIT 1), NOW() - INTERVAL '3 days'),
  ((SELECT id FROM members WHERE member_id = 'SH789012'), 'pending', 
   (SELECT id FROM users WHERE role = 'coach' LIMIT 1), NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;
