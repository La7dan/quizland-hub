
/**
 * Environment configuration for the application
 */

// Set default API URL based on environment
const getDevelopmentApiUrl = () => {
  // Use relative URLs to avoid CORS and port issues
  return '/api';
};

// Environment variables with fallbacks
export const ENV = {
  // API Base URL (use relative URL to avoid port issues)
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
    CURRENT_URL: typeof window !== 'undefined' ? window.location.href : 'unknown',
    BASE_PATH: typeof window !== 'undefined' ? window.location.origin : 'unknown',
  });
};

// Call logEnvironment when importing env.ts to debug connection issues
if (typeof window !== 'undefined' && ENV.DEBUG) {
  console.log('API requests will be sent to:', ENV.API_BASE_URL);
}
