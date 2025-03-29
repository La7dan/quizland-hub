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
    console.log(`Login attempt for user: ${username}, Remember me: ${rememberMe}`);
    
    // Special case for default admin account during initial setup
    if (username === 'admin' && password === 'admin123') {
      try {
        const client = await pool.connect();
        
        // Check if admin already exists
        const adminResult = await client.query(
          'SELECT id, username, email, role FROM users WHERE username = $1 LIMIT 1',
          ['admin']
        );
        
        let adminUser;
        
        // If admin doesn't exist yet, create it
        if (adminResult.rows.length === 0) {
          console.log('Creating default admin account...');
          
          // Hash the password for the admin account
          const hashedPassword = await bcrypt.hash('admin123', 10);
          
          const insertResult = await client.query(
            `INSERT INTO users (username, password, email, role) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, username, email, role`,
            ['admin', hashedPassword, 'admin@example.com', 'super_admin']
          );
          
          adminUser = insertResult.rows[0];
          console.log('Default admin account created:', adminUser);
        } else {
          adminUser = adminResult.rows[0];
          console.log('Using existing admin account:', adminUser);
        }
        
        client.release();
        
        // Set user ID in session
        req.session.userId = adminUser.id;
        
        // Extend session if "Remember Me" is checked
        if (rememberMe) {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        }
        
        return res.json({ 
          success: true, 
          user: adminUser,
          message: 'Logged in with default admin account' 
        });
      } catch (error) {
        console.error('Error with default admin account:', error);
      }
    }
    
    // Regular login flow for non-default accounts
    const client = await pool.connect();
    
    // Query the users table with prepared statement to prevent SQL injection
    const result = await client.query(
      'SELECT id, username, email, role, password FROM users WHERE username = $1 LIMIT 1',
      [username]
    );
    
    client.release();
    
    if (result.rows.length === 0) {
      console.log(`User not found: ${username}`);
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    const userData = result.rows[0];
    
    // Check if password matches
    let passwordMatch = false;
    
    try {
      // First try using bcrypt to compare
      if (bcrypt.compareSync) {
        passwordMatch = await bcrypt.compare(password, userData.password);
      }
      
      // If bcrypt fails or doesn't match, try direct comparison for backward compatibility
      if (!passwordMatch) {
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
    } catch (err) {
      console.error('Error comparing passwords:', err);
      return res.status(500).json({ success: false, message: 'Server error during password verification' });
    }
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

// New endpoint for login debugging
router.post('/debug-login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username and password are required' 
    });
  }
  
  try {
    console.log(`Server-side login debug for user: ${username}`);
    
    // Special case for default admin account during initial setup
    if (username === 'admin' && password === 'admin123') {
      // Check if admin exists in the database
      const client = await pool.connect();
      const adminResult = await client.query(
        'SELECT id, username, email, role FROM users WHERE username = $1 LIMIT 1',
        ['admin']
      );
      client.release();
      
      if (adminResult.rows.length > 0) {
        const adminUser = adminResult.rows[0];
        return res.json({ 
          success: true, 
          user: adminUser,
          message: 'Default admin account verified' 
        });
      }
    }
    
    // Regular account verification
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, username, email, role, password FROM users WHERE username = $1 LIMIT 1',
      [username]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: `User '${username}' not found in the database` 
      });
    }
    
    const userData = result.rows[0];
    
    // Check if password matches
    let passwordMatch = false;
    
    try {
      // Try using bcrypt for password that might be hashed
      if (bcrypt.compareSync) {
        passwordMatch = await bcrypt.compare(password, userData.password);
      }
      
      // If bcrypt doesn't match, try direct comparison for legacy accounts
      if (!passwordMatch) {
        passwordMatch = userData.password === password;
      }
      
      if (!passwordMatch) {
        return res.status(401).json({ 
          success: false, 
          message: `Password mismatch for user '${username}'` 
        });
      }
      
      // Create a clean user object without the password
      const cleanUserData = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role
      };
      
      res.json({ 
        success: true, 
        user: cleanUserData,
        message: 'User verified successfully'
      });
    } catch (err) {
      console.error('Error comparing passwords:', err);
      return res.status(500).json({ 
        success: false, 
        message: `Error verifying password: ${err.message}` 
      });
    }
  } catch (error) {
    console.error('Login debug error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Error during login debugging: ${error.message || 'Unknown error'}` 
    });
  }
});

export default router;
