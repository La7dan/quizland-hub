
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const SERVER_CONFIG = {
  PORT: process.env.PORT || 8080,
  SESSION_SECRET: process.env.SESSION_SECRET || 'quiz-app-secret-key-change-in-production',
  COOKIE_MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  EXTENDED_COOKIE_MAX_AGE: 30 * 24 * 60 * 60 * 1000, // 30 days for "Remember Me"
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};
