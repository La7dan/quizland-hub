
import { ENV } from '@/config/env';

// Connection status caching
let lastConnectionCheck = 0;
let cachedConnectionStatus = null;
const CONNECTION_CACHE_TTL = 30000; // 30 seconds

// Check database connection with caching
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
        throw new Error("Received non-JSON response from server");
      }
      
      const data = await response.json();
      
      // Cache the result
      lastConnectionCheck = now;
      cachedConnectionStatus = data;
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // If we got a response but not JSON, assume server is up but not returning expected response
      if (error.message && (
          error.message.includes("Unexpected token") || 
          error.message.includes("invalid JSON")
        )) {
        console.warn("Server returned non-JSON response");
        const fallbackResult = { 
          success: false, 
          message: "Server returned unexpected response format"
        };
        lastConnectionCheck = now;
        cachedConnectionStatus = fallbackResult;
        return fallbackResult;
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Connection check error:', error);
    
    // Cache the negative result too, but for a shorter time
    lastConnectionCheck = now;
    cachedConnectionStatus = { success: false, message: 'Failed to connect to the server' };
    
    return cachedConnectionStatus;
  }
};
