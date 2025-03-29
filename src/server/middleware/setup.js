
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { SERVER_CONFIG } from '../config/server.js';
import { UPLOADS_DIR } from '../config/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function setupMiddleware(app) {
  // CORS configuration
  app.use(cors({
    origin: true, // Allow the frontend origin
    credentials: true // Allow cookies to be sent
  }));
  
  // Basic middleware
  app.use(cookieParser());
  app.use(bodyParser.json());

  // Session configuration
  app.use(session({
    secret: SERVER_CONFIG.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: SERVER_CONFIG.IS_PRODUCTION, // Use secure cookies in production
      httpOnly: true, // Prevent client-side JS from reading the cookie
      maxAge: SERVER_CONFIG.COOKIE_MAX_AGE // Default is 24 hours
    }
  }));

  // Serve static files in production
  if (SERVER_CONFIG.IS_PRODUCTION) {
    app.use(express.static(path.join(__dirname, '../../../dist')));
  }

  // Serve uploaded files with proper CORS headers
  app.use('/files', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    next();
  }, express.static(UPLOADS_DIR));
  
  return { __dirname };
}

export function setupProductionRoutes(app, dirname) {
  // Serve index.html for any routes not matched in production
  if (SERVER_CONFIG.IS_PRODUCTION) {
    app.get('*', (req, res) => {
      res.sendFile(path.join(dirname, '../../../dist', 'index.html'));
    });
  }
}
