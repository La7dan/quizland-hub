
import pool from '../config/database.js';

// Authentication middleware
const requireAuth = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
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
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export { requireAuth };
