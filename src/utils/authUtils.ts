
import { User } from '@/types/auth';
import { ENV } from '@/config/env';

// Custom API URL for auth endpoints
export const AUTH_API_URL = `${ENV.API_BASE_URL}/auth`;

// Authentication utility functions
export const checkAuthStatus = async (): Promise<{ authenticated: boolean; user: User | null }> => {
  try {
    console.log('Checking authentication status...');
    console.log('Using auth API URL:', AUTH_API_URL);
    
    const response = await fetch(`${AUTH_API_URL}/check`, {
      credentials: 'include', // Important for cookies
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // Log response details for debugging
    console.log('Auth check response status:', response.status);
    console.log('Auth check response headers:', [...response.headers.entries()]);
    
    // Check if the request was successful
    if (response.status === 401 || response.status === 403) {
      console.log('User is not authenticated (401/403 response)', response.status);
      return { authenticated: false, user: null };
    }
    
    // Check the content type to avoid parsing HTML as JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Auth check response:', data);
      
      if (data.authenticated && data.user) {
        return { authenticated: true, user: data.user };
      } else if (data.success === false && data.message === "Authentication required") {
        // This is the specific response we're getting from the server
        console.log('Auth check received "Authentication required" message');
        return { authenticated: false, user: null };
      }
    } else {
      console.warn('Server returned non-JSON response for auth check. This usually means the server is not running or incorrect API URL configuration.');
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
    console.log('Using auth API URL:', AUTH_API_URL);
    
    // Call the server's login API endpoint
    const response = await fetch(`${AUTH_API_URL}/login`, {
      method: 'POST',
      credentials: 'include', // Important for cookies
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password, rememberMe })
    });
    
    // Log complete response for debugging
    console.log('Login response status:', response.status);
    console.log('Login response headers:', [...response.headers.entries()]);
    
    // Check the content type to avoid parsing HTML as JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Server returned non-JSON response. This usually means the server is not running or incorrect API URL configuration.');
      return { 
        success: false, 
        user: null, 
        message: "Server error: Received non-JSON response. Please ensure the backend server is running at " + ENV.API_BASE_URL
      };
    }
    
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = "Invalid credentials";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.log('Login error data:', errorData);
      } catch (e) {
        // If we can't parse JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      console.error('Login failed with status:', response.status, errorMessage);
      
      // Provide more helpful message for default admin account
      if (username === 'admin' && response.status === 401) {
        return { 
          success: false, 
          user: null, 
          message: "Login failed. For the default admin account, ensure the username is 'admin' and password is 'admin123'"
        };
      }
      
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
    const errorMessage = "An error occurred during login. Please check that the backend server is running at " + ENV.API_BASE_URL;
    return { success: false, user: null, message: errorMessage };
  }
};

export const logoutUser = async (): Promise<{ success: boolean; message?: string }> => {
  try {
    // Call logout API endpoint to clear the cookie
    const response = await fetch(`${AUTH_API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // Check content type before trying to parse JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        const result = await response.json();
        console.log('Logout response:', result);
        return { success: true, message: result.message };
      } catch (e) {
        console.log('Logout completed (no response data)');
        return { success: true, message: "You have been successfully logged out" };
      }
    } else {
      console.warn('Server returned non-JSON response for logout');
      return { success: true, message: "You have been logged out" };
    }
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: "There was an error communicating with the server" };
  }
};
