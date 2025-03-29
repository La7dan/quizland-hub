
import express from 'express';
import pool, { getConnectionStatus } from '../../config/database.js';

const router = express.Router();

// Cache connection status
let cachedConnectionStatus = {
  success: false,
  timestamp: 0,
  message: 'Not checked yet'
};

const CONNECTION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Test database connection - public endpoint, no auth required
router.get('/check-connection', async (req, res) => {
  // Make sure the content type is set to JSON
  res.setHeader('Content-Type', 'application/json');
  
  const now = Date.now();
  const { isConnected } = getConnectionStatus();
  
  // If we already know we're connected, return cached status
  if (isConnected && cachedConnectionStatus.success && 
      (now - cachedConnectionStatus.timestamp < CONNECTION_CACHE_DURATION)) {
    return res.json({ 
      success: true, 
      message: 'Using cached connection status (connected)', 
      cached: true 
    });
  }
  
  try {
    console.log('Attempting database connection (API check)...');
    const client = await pool.connect();
    client.release();
    
    console.log('Database connection successful (API check)');
    
    // Update cached status
    cachedConnectionStatus = {
      success: true,
      timestamp: now,
      message: 'Database connection successful'
    };
    
    res.json({ 
      success: true, 
      message: 'Database connection successful',
      cached: false
    });
  } catch (error) {
    console.error('Database connection error (API check):', error);
    
    // Update cached status to failure
    cachedConnectionStatus = {
      success: false,
      timestamp: now,
      message: 'Database connection failed'
    };
    
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
});

export default router;
