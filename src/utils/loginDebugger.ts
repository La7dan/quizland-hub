
import { verifyUserLogin } from '@/services/userService';

// Utility function to debug authentication issues
export const debugLogin = async (username: string, password: string): Promise<string> => {
  console.log(`Debugging login for user: ${username}`);
  
  try {
    // First, check if we can retrieve and verify the user
    const result = await verifyUserLogin(username, password);
    
    if (!result.success) {
      return `Login verification failed: ${result.message}`;
    }
    
    // If we got here, direct verification through SQL succeeded
    return `✅ Login verification through direct DB check successful:
    - User exists with ID: ${result.user?.id}
    - Role: ${result.user?.role}
    - Email: ${result.user?.email}
    
    If login still fails through the UI, it may be an issue with the session handling or cookies.`;
  } catch (error) {
    console.error('Login debug error:', error);
    return `Error during login debugging: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};
