
import { ENV } from '@/config/env';

// Connection status caching
let lastConnectionCheck = 0;
let cachedConnectionStatus = null;
const CONNECTION_CACHE_TTL = 30000; // 30 seconds

// Check database connection with improved error handling
export const checkConnection = async (): Promise<{ success: boolean; message: string; cached?: boolean }> => {
  const now = Date.now();
  
  // Return cached result if available and not expired
  if (cachedConnectionStatus && now - lastConnectionCheck < CONNECTION_CACHE_TTL) {
    return { ...cachedConnectionStatus, cached: true };
  }
  
  try {
    console.log('Checking database connection...');
    
    // Add timeout to prevent long hanging request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      // Use relative URL to avoid port issues
      const response = await fetch(`/api/database/check-connection`, {
        signal: controller.signal,
        credentials: 'include' // Include cookies for authentication
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
          message: "Connection timed out. The database server may be overloaded or unreachable."
        };
        lastConnectionCheck = now;
        cachedConnectionStatus = timeoutResult;
        return timeoutResult;
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Connection check error:', error);
    
    // Create appropriate error message based on error type
    let errorMessage = 'Failed to connect to the server';
    
    if (error.message && error.message.includes('404')) {
      errorMessage = 'API endpoint not found. The server might not be properly configured.';
    } else if (error.message && error.message.includes('Failed to fetch')) {
      errorMessage = 'Network error. The server might be down or unreachable.';
    }
    
    // Cache the negative result too, but for a shorter time
    lastConnectionCheck = now;
    cachedConnectionStatus = { success: false, message: errorMessage };
    
    return cachedConnectionStatus;
  }
};
