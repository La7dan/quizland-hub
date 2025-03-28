
/**
 * Environment configuration for the application
 */

// Set default API URL based on environment
const getDevelopmentApiUrl = () => {
  // Always use the explicit server IP and port as provided in the error message
  return 'http://209.74.89.41:8080/api';
};

// Environment variables with fallbacks
export const ENV = {
  // API Base URL (default to server IP for development)
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || getDevelopmentApiUrl(),
  
  // Environment name
  NODE_ENV: import.meta.env.MODE || 'development',
  
  // Debug mode
  DEBUG: import.meta.env.VITE_DEBUG === 'true' || true, // Set to true to see more logs
};

// Export a function to log environment configuration (useful for debugging)
export const logEnvironment = () => {
  console.log('🔧 Environment Configuration:', {
    API_BASE_URL: ENV.API_BASE_URL,
    NODE_ENV: ENV.NODE_ENV,
    DEBUG: ENV.DEBUG,
  });
};
