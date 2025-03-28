
import pg from 'pg';
const { Pool } = pg;

// Create a singleton database connection pool
let pool;

// Track connection status to avoid repeated logging
let isConnected = false;
let lastConnectionAttempt = 0;
const CONNECTION_ATTEMPT_INTERVAL = 60000; // 1 minute

// Get the database connection pool (singleton pattern)
const getPool = () => {
  if (!pool) {
    console.log('Creating new database connection pool...');
    
    // Database connection configuration
    pool = new Pool({
      host: '209.74.89.41',
      user: 'quiz',
      password: 'Lal@13161',
      database: 'quiz',
      port: 5432,
      // Connection configuration - optimized settings
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 20, // maximum number of clients in the pool
    });

    // Only test connection if needed and not done recently
    const now = Date.now();
    if (!isConnected && (now - lastConnectionAttempt > CONNECTION_ATTEMPT_INTERVAL)) {
      lastConnectionAttempt = now;
      console.log('Testing database connection...');
      
      pool.connect()
        .then(client => {
          console.log('Database connection successful!');
          isConnected = true;
          client.release();
        })
        .catch(err => {
          console.error('Database connection failed:', err);
          isConnected = false;
        });
    }

    // Add error handling for the pool
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      isConnected = false;
    });
  }
  
  return pool;
};

// Initialize the pool on module import but don't auto-test
const databasePool = getPool();

// Export connection status along with the pool
export const getConnectionStatus = () => ({
  isConnected,
  lastAttempt: lastConnectionAttempt
});

export default databasePool;
