
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
    // Add helper properties for role checking
    req.user.isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    req.user.isSuperAdmin = req.user.role === 'super_admin';
    req.user.isCoach = req.user.role === 'coach';
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// Super admin-only middleware
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Super admin access required' });
  }
  next();
};

// Coach or admin middleware - allows both coaches and admins to access
const requireCoachOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'coach' && req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({ success: false, message: 'Coach or admin access required' });
  }
  next();
};

export { requireAuth, requireAdmin, requireSuperAdmin, requireCoachOrAdmin };
