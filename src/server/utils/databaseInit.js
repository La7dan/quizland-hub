
import pool, { getConnectionStatus } from '../config/database.js';

export async function initializeDatabase() {
  try {
    // First check if we're already connected rather than making a new connection
    const { isConnected } = getConnectionStatus();
    if (isConnected) {
      console.log('Database already connected, skipping connection test');
      return;
    }
    
    const client = await pool.connect();
    
    // Check if evaluation_result column exists
    const columnCheckResult = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'evaluations'
      AND column_name = 'evaluation_result';
    `);
    
    // If column doesn't exist, add it
    if (columnCheckResult.rows.length === 0) {
      console.log('Adding evaluation_result column to evaluations table...');
      await client.query(`
        ALTER TABLE evaluations
        ADD COLUMN evaluation_result VARCHAR(20) CHECK (evaluation_result IN ('passed', 'not_ready')),
        ADD COLUMN updated_at TIMESTAMP;
      `);
      console.log('Column added successfully');
    }
    
    client.release();
    return true;
  } catch (error) {
    console.error('Error initializing database schema:', error);
    return false;
  }
}
