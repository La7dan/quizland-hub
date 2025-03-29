
import { ENV } from '@/config/env';

// Get API base URL from environment config
const API_BASE_URL = ENV.API_BASE_URL;

// Base API call function
export const callApi = async <T>(
  endpoint: string, 
  method: 'GET' | 'POST' = 'GET', 
  body?: any
): Promise<T> => {
  try {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include' // Important to include cookies for authentication
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    // Ensure endpoint doesn't start with a slash to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    console.log(`Making ${method} request to: ${API_BASE_URL}/${cleanEndpoint}`);
    
    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    options.signal = controller.signal;
    
    try {
      const response = await fetch(`${API_BASE_URL}/${cleanEndpoint}`, options);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Check for authentication errors
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in.');
        }
        
        if (response.status === 403) {
          throw new Error('Access denied. You do not have sufficient privileges.');
        }
        
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText || response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error(`API error (${endpoint}):`, error);
    throw error;
  }
};
