
import pg from 'pg';
const { Pool } = pg;

// Create a singleton database connection pool
let pool;

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
      // Connection configuration
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 20, // maximum number of clients in the pool
    });

    // Test the database connection immediately on startup
    console.log('Testing database connection...');
    pool.connect()
      .then(client => {
        console.log('Database connection successful!');
        client.release();
      })
      .catch(err => {
        console.error('Database connection failed:', err);
      });

    // Add error handling for the pool
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  
  return pool;
};

// Initialize the pool on module import
const databasePool = getPool();

export default databasePool;
