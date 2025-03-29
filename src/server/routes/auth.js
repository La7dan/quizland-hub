
import express from 'express';
import pool from '../config/database.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Authentication routes
router.post('/login', async (req, res) => {
  const { username, password, rememberMe } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }
  
  try {
    const client = await pool.connect();
    
    // Query the users table with prepared statement to prevent SQL injection
    const result = await client.query(
      'SELECT id, username, email, role, password FROM users WHERE username = $1 LIMIT 1',
      [username]
    );
    
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    const userData = result.rows[0];
    
    // Check if this is the default admin account (unsafe for production but useful for demo)
    if (username === 'admin' && password === 'admin123' && userData.username === 'admin') {
      // Set user ID in session
      req.session.userId = userData.id;
      
      // If "Remember Me" is checked, extend the session/cookie lifetime
      if (rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        console.log(`Extended session lifetime to 30 days for user ${username}`);
      }
      
      // Create a clean user object without the password
      const cleanUserData = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role
      };
      
      return res.json({ success: true, user: cleanUserData });
    }
    
    // For all other users, verify the password using proper password comparison
    let passwordMatch = false;
    
    if (bcrypt.compareSync) {
      // If bcrypt is properly installed, use it to compare
      try {
        passwordMatch = await bcrypt.compare(password, userData.password);
      } catch (err) {
        console.error('Error comparing passwords with bcrypt:', err);
        // Fallback to direct comparison if bcrypt fails
        passwordMatch = userData.password === password;
      }
    } else {
      // Direct comparison as fallback (not secure but allows testing)
      passwordMatch = userData.password === password;
    }
    
    if (!passwordMatch) {
      console.log(`Failed login attempt for user: ${username}`);
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    
    // Set user ID in session
    req.session.userId = userData.id;
    
    // If "Remember Me" is checked, extend the session/cookie lifetime
    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      console.log(`Extended session lifetime to 30 days for user ${username}`);
    }
    
    // Create a clean user object without the password
    const cleanUserData = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role
    };
    
    console.log(`Successful login for user: ${username}, role: ${userData.role}`);
    res.json({ success: true, user: cleanUserData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, message: 'Error during logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

router.get('/check', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      authenticated: false, 
      message: 'Authentication required' 
    });
  }
  
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, username, email, role FROM users WHERE id = $1',
      [req.session.userId]
    );
    client.release();
    
    if (result.rows.length === 0) {
      req.session.destroy();
      return res.status(401).json({ 
        authenticated: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      authenticated: true, 
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ 
      authenticated: false, 
      message: 'Server error' 
    });
  }
});

export default router;
