
// Client-safe login debugger utility that doesn't use Node.js-specific modules

// Function to debug authentication issues through the API
export const debugLogin = async (username: string, password: string): Promise<string> => {
  console.log(`Debugging login for user: ${username}`);
  
  try {
    // Use fetch API to call the server endpoint instead of directly using pg
    const response = await fetch('/api/auth/debug-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include', // Include cookies for session checks
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return `Login verification failed: ${errorText || response.statusText}`;
    }
    
    const result = await response.json();
    
    if (result.success) {
      return `✅ Login verification successful:
      - User exists with ID: ${result.user.id}
      - Role: ${result.user.role}
      - Email: ${result.user.email}
      
      If login still fails through the UI, it may be an issue with the session handling or cookies.`;
    } else {
      return `Login verification failed: ${result.message}`;
    }
  } catch (error) {
    console.error('Login debug error:', error);
    return `Error during login debugging: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};
