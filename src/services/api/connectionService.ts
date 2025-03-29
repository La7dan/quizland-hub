
import { ENV } from '@/config/env';

// Improved connection status caching with more robust timing
let lastConnectionCheck = 0;
let cachedConnectionStatus: { success: boolean; message: string } | null = null;

// Check database connection with improved error handling
export const checkConnection = async (): Promise<{ success: boolean; message: string; cached?: boolean }> => {
  const now = Date.now();
  
  // Return cached result if available and not expired
  if (cachedConnectionStatus && now - lastConnectionCheck < ENV.CACHE_DURATION) {
    return { ...cachedConnectionStatus, cached: true };
  }
  
  try {
    console.log('Checking database connection...');
    
    // Add timeout to prevent long hanging request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ENV.CONNECTION_TIMEOUT);
    
    try {
      // Use relative URL to avoid port issues
      const response = await fetch(`/api/database/check-connection`, {
        signal: controller.signal,
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      clearTimeout(timeoutId);
      
      // Check if the response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Database server returned non-JSON response:", await response.text());
        throw new Error("Received non-JSON response from server");
      }
      
      const data = await response.json();
      
      // Cache the result
      lastConnectionCheck = now;
      cachedConnectionStatus = data;
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle different error types
      if (error instanceof Error) {
        // If we got a response but it's not JSON, the server might be running but not properly configured
        if (error.message && error.message.includes("Received non-JSON response")) {
          console.error("Server is running but not configured correctly for API requests");
          const fallbackResult = { 
            success: false, 
            message: "The server is running but not configured for API requests. Please check server configuration."
          };
          lastConnectionCheck = now;
          cachedConnectionStatus = fallbackResult;
          return fallbackResult;
        }
        
        // Handle connection abort (timeout)
        if (error.name === 'AbortError') {
          console.error("Connection timeout when checking database connection");
          const timeoutResult = {
            success: false,
            message: `Connection timed out after ${ENV.CONNECTION_TIMEOUT/1000}s. The database server may be overloaded or unreachable.`
          };
          lastConnectionCheck = now;
          cachedConnectionStatus = timeoutResult;
          return timeoutResult;
        }
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Connection check error:', error);
    
    // Create appropriate error message based on error type
    let errorMessage = 'Failed to connect to the server';
    
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        errorMessage = 'API endpoint not found. The server might not be properly configured.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. The server might be down or unreachable.';
      } else {
        errorMessage = `Connection error: ${error.message}`;
      }
    }
    
    // Cache the negative result too, but for a shorter time
    lastConnectionCheck = now;
    cachedConnectionStatus = { success: false, message: errorMessage };
    
    return cachedConnectionStatus;
  }
};

// Clear connection cache - useful when manually triggering new connection checks
export const clearConnectionCache = (): void => {
  cachedConnectionStatus = null;
  lastConnectionCheck = 0;
};
