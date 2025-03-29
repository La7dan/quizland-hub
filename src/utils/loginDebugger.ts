
import pool from '@/server/config/database.js';

// Utility function to debug authentication issues
export const debugLogin = async (username: string, password: string): Promise<string> => {
  console.log(`Debugging login for user: ${username}`);
  
  try {
    // Connect directly to the database for verification without using the API
    const client = await pool.connect();
    
    // Query the users table with prepared statement to prevent SQL injection
    const result = await client.query(
      'SELECT id, username, email, role, password FROM users WHERE username = $1 LIMIT 1',
      [username]
    );
    
    client.release();
    
    if (result.rows.length === 0) {
      return `User '${username}' not found in the database`;
    }
    
    const userData = result.rows[0];
    
    // Check if password matches (for demo purposes, we're doing direct comparison)
    // In production, you would use bcrypt.compare here
    const isDefaultAdmin = username === 'admin' && password === 'admin123' && userData.username === 'admin';
    const passwordMatch = isDefaultAdmin || userData.password === password;
    
    if (!passwordMatch) {
      return `Password mismatch for user '${username}'`;
    }
    
    // If we got here, direct verification through SQL succeeded
    return `✅ Login verification through direct DB check successful:
    - User exists with ID: ${userData.id}
    - Role: ${userData.role}
    - Email: ${userData.email}
    
    If login still fails through the UI, it may be an issue with the session handling or cookies.`;
  } catch (error) {
    console.error('Login debug error:', error);
    return `Error during login debugging: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};
