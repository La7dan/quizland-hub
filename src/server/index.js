
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import fs from 'fs';

// Import routes
import authRoutes from './routes/auth.js';
import databaseRoutes from './routes/database.js';
import membersRoutes from './routes/members.js';
import evaluationsRoutes from './routes/evaluations.js';

// Import config
import pool from './config/database.js';
import { UPLOADS_DIR } from './config/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables or defaults
const PORT = process.env.PORT || 8080;
const SESSION_SECRET = process.env.SESSION_SECRET || 'quiz-app-secret-key-change-in-production';
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
const EXTENDED_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days for "Remember Me"

const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow the frontend origin
  credentials: true // Allow cookies to be sent
}));
app.use(cookieParser());
app.use(bodyParser.json());

// Session configuration
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true, // Prevent client-side JS from reading the cookie
    maxAge: COOKIE_MAX_AGE // Default is 24 hours
  }
}));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));
}

// Serve uploaded files with proper CORS headers
app.use('/files', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  next();
}, express.static(UPLOADS_DIR));

// Apply routes
app.use('/api/auth', authRoutes);
app.use('/api', databaseRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/evaluations', evaluationsRoutes);

// Serve index.html for any routes not matched in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize database - ensure the evaluations table has the evaluation_result column
  (async () => {
    try {
      const client = await pool.connect();
      
      // Check if evaluation_result column exists
      const columnCheckResult = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'evaluations'
        AND column_name = 'evaluation_result';
      `);
      
      // If column doesn't exist, add it
      if (columnCheckResult.rows.length === 0) {
        console.log('Adding evaluation_result column to evaluations table...');
        await client.query(`
          ALTER TABLE evaluations
          ADD COLUMN evaluation_result VARCHAR(20) CHECK (evaluation_result IN ('passed', 'not_ready')),
          ADD COLUMN updated_at TIMESTAMP;
        `);
        console.log('Column added successfully');
      }
      
      client.release();
    } catch (error) {
      console.error('Error initializing database schema:', error);
    }
  })();
});

// Handle process termination
process.on('SIGINT', () => {
  pool.end();
  console.log('Database pool has ended');
  process.exit(0);
});

export default app;
