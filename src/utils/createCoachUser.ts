
import { executeSql } from '@/services/apiService';
import bcrypt from 'bcrypt';

/**
 * Utility function to create a coach user account
 * This should be run in the server environment
 */
export const createCoachUser = async (
  username: string,
  password: string,
  email: string
): Promise<{ success: boolean; message: string; userId?: number }> => {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert the coach account
    const result = await executeSql(`
      INSERT INTO users (username, password, email, role)
      VALUES ('${username}', '${hashedPassword}', '${email}', 'coach')
      RETURNING id, username, email, role;
    `);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    console.log('Coach account created:', result.rows?.[0]);
    
    return { 
      success: true, 
      message: 'Coach account created successfully',
      userId: result.rows?.[0]?.id
    };
  } catch (error) {
    console.error('Error creating coach account:', error);
    return { 
      success: false, 
      message: `Failed to create coach account: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Create a test coach account without using bcrypt (for client-side testing only)
 */
export const createTestCoachAccount = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // First check if the account already exists
    const checkResult = await executeSql(`
      SELECT id FROM users WHERE username = 'coach'
    `);
    
    if (checkResult.success && checkResult.rows && checkResult.rows.length > 0) {
      return { success: true, message: 'Coach account already exists' };
    }
    
    // Create the account with a plain text password (not recommended for production)
    const result = await executeSql(`
      INSERT INTO users (username, password, email, role)
      VALUES ('coach', 'coach123', 'coach@example.com', 'coach')
      ON CONFLICT (username) DO NOTHING
      RETURNING id;
    `);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    if (!result.rows || result.rows.length === 0) {
      return { success: true, message: 'Coach account already exists' };
    }
    
    return { success: true, message: 'Test coach account created successfully' };
  } catch (error) {
    console.error('Error creating test coach account:', error);
    return { success: false, message: `Failed to create test coach account: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};
