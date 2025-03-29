
import { ENV } from '@/config/env';

// Get API base URL from environment config
const API_BASE_URL = ENV.API_BASE_URL;

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
    console.log(`Connecting to: ${API_BASE_URL}/check-connection`);
    
    // Add timeout to prevent long hanging request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(`${API_BASE_URL}/check-connection`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      // Cache the result
      lastConnectionCheck = now;
      cachedConnectionStatus = data;
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
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
