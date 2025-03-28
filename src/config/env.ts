
/**
 * Environment configuration for the application
 */

// Set default API URL based on environment
const getDevelopmentApiUrl = () => {
  // In development, try to connect to the local server
  return 'http://localhost:8080/api';
};

// Environment variables with fallbacks
export const ENV = {
  // API Base URL (default to localhost for development)
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || getDevelopmentApiUrl(),
  
  // Environment name
  NODE_ENV: import.meta.env.MODE || 'development',
  
  // Debug mode
  DEBUG: import.meta.env.VITE_DEBUG === 'true' || false,
};

// Export a function to log environment configuration (useful for debugging)
export const logEnvironment = () => {
  if (ENV.DEBUG) {
    console.log('🔧 Environment Configuration:', {
      API_BASE_URL: ENV.API_BASE_URL,
      NODE_ENV: ENV.NODE_ENV,
      DEBUG: ENV.DEBUG,
    });
  }
};
