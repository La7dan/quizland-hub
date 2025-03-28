
import { User } from '@/types/auth';

// Custom API URL for auth endpoints - using the consistent API base URL
export const AUTH_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://209.74.89.41:8080/api/auth';

// Authentication utility functions
export const checkAuthStatus = async (): Promise<{ authenticated: boolean; user: User | null }> => {
  try {
    console.log('Checking authentication status...');
    const response = await fetch(`${AUTH_API_URL}/check`, {
      credentials: 'include', // Important for cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Auth check response:', data);
      if (data.authenticated && data.user) {
        return { authenticated: true, user: data.user };
      }
    } else {
      console.log('Auth check failed with status:', response.status);
      // For 401 or 403, this is expected for unauthenticated users, so don't show an error
      if (response.status !== 401 && response.status !== 403) {
        console.error('Unexpected auth check response:', response.status);
      }
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
  }
  
  return { authenticated: false, user: null };
};

export const loginUser = async (
  username: string, 
  password: string, 
  rememberMe: boolean = false
): Promise<{ success: boolean; user: User | null; message?: string }> => {
  try {
    console.log('Login attempt for user:', username, 'Remember me:', rememberMe);
    
    // Call the server's login API endpoint
    const response = await fetch(`${AUTH_API_URL}/login`, {
      method: 'POST',
      credentials: 'include', // Important for cookies
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password, rememberMe })
    });
    
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = "Invalid credentials";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If we can't parse JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      console.error('Login failed with status:', response.status, errorMessage);
      return { success: false, user: null, message: errorMessage };
    }
    
    const result = await response.json();
    console.log('Login response:', result);
    
    if (result.success) {
      console.log('Login successful', result.user);
      return { success: true, user: result.user, message: result.message };
    } else {
      console.log('Login failed:', result.message);
      return { success: false, user: null, message: result.message || "Invalid credentials" };
    }
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = "An error occurred during login. Please check your connection and try again.";
    return { success: false, user: null, message: errorMessage };
  }
};

export const logoutUser = async (): Promise<{ success: boolean; message?: string }> => {
  try {
    // Call logout API endpoint to clear the cookie
    const response = await fetch(`${AUTH_API_URL}/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    
    // Even if there's an error, we'll still clear the local user state
    try {
      const result = await response.json();
      console.log('Logout response:', result);
      return { success: true, message: result.message };
    } catch (e) {
      console.log('Logout completed (no response data)');
      return { success: true, message: "You have been successfully logged out" };
    }
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: "There was an error communicating with the server" };
  }
};
