
-- Create users table with roles (super_admin, admin, coach)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'admin', 'coach')),
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

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  course_id INTEGER REFERENCES courses(id),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  quiz_id INTEGER REFERENCES quizzes(id),
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
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

-- Insert sample super admin user
INSERT INTO users (username, password, email, role)
VALUES ('superadmin', 'password123', 'superadmin@example.com', 'super_admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample admin user
INSERT INTO users (username, password, email, role)
VALUES ('admin', 'password123', 'admin@example.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample coach user
INSERT INTO users (username, password, email, role)
VALUES ('coach', 'password123', 'coach@example.com', 'coach')
ON CONFLICT (username) DO NOTHING;
