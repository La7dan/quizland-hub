
import { ENV } from '@/config/env';

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
    
    // Use relative URL to avoid port issues
    const url = `/api/${cleanEndpoint}`;
    console.log(`Making ${method} request to: ${url}`);
    
    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    options.signal = controller.signal;
    
    try {
      const response = await fetch(url, options);
      clearTimeout(timeoutId);
      
      // Check for connection issues like 404 (API not found)
      if (response.status === 404) {
        console.error(`API endpoint not found: ${url}`);
        throw new Error(`API endpoint not found: ${url}. The server might not be properly configured.`);
      }
      
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
      
      // Check if the response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Server returned non-JSON response:", await response.clone().text());
        throw new Error("Received non-JSON response from server");
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Enhance error for timeout cases
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after 10 seconds. The server might be overloaded or unreachable.`);
      }
      
      throw error;
    }
  } catch (error) {
    console.error(`API error (${endpoint}):`, error);
    throw error;
  }
};
