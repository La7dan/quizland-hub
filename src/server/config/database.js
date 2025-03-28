
import pg from 'pg';
const { Pool } = pg;

// Database connection configuration
const pool = new Pool({
  host: '209.74.89.41',
  user: 'quiz',
  password: 'Lal@13161',
  database: 'quiz',
  port: 5432,
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

export default pool;
