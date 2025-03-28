
/**
 * Environment configuration for the application
 */

// Set default API URL based on environment
const getDevelopmentApiUrl = () => {
  // In development, we can use the relative path which will work both locally
  // and when deployed if the server is on the same origin
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // For local development
    return 'http://209.74.89.41:8080/api';
  }
  
  // For development on the project domain or when deployed, use relative URL
  // which avoids CORS issues and works when frontend/backend are on same origin
  return '/api';
};

// Environment variables with fallbacks
export const ENV = {
  // API Base URL (default to server IP for development)
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
