
/**
 * Environment configuration for the application
 */

// Types for environment variables
interface EnvironmentConfig {
  API_BASE_URL: string;
  NODE_ENV: string;
  DEBUG: boolean;
  CONNECTION_TIMEOUT: number;
  RETRY_ATTEMPTS: number;
  CACHE_DURATION: number;
}

// Set default API URL based on environment
const getDevelopmentApiUrl = (): string => {
  // Use relative URLs to avoid CORS and port issues
  return '/api';
};

// Environment variables with fallbacks and validation
export const ENV: EnvironmentConfig = {
  // API Base URL (use relative URL to avoid port issues)
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || getDevelopmentApiUrl(),
  
  // Environment name
  NODE_ENV: import.meta.env.MODE || 'development',
  
  // Debug mode
  DEBUG: import.meta.env.VITE_DEBUG === 'true' || true, // Set to true to see more logs

  // Connection timeout in milliseconds
  CONNECTION_TIMEOUT: Number(import.meta.env.VITE_CONNECTION_TIMEOUT) || 10000,
  
  // Number of retry attempts for API calls
  RETRY_ATTEMPTS: Number(import.meta.env.VITE_RETRY_ATTEMPTS) || 3,
  
  // Cache duration in milliseconds
  CACHE_DURATION: Number(import.meta.env.VITE_CACHE_DURATION) || 300000, // 5 minutes
};

// Export a function to log environment configuration (useful for debugging)
export const logEnvironment = (): void => {
  if (!ENV.DEBUG) return;
  
  console.log('🔧 Environment Configuration:', {
    API_BASE_URL: ENV.API_BASE_URL,
    NODE_ENV: ENV.NODE_ENV,
    DEBUG: ENV.DEBUG,
    CONNECTION_TIMEOUT: ENV.CONNECTION_TIMEOUT,
    RETRY_ATTEMPTS: ENV.RETRY_ATTEMPTS,
    CACHE_DURATION: ENV.CACHE_DURATION,
    CURRENT_URL: typeof window !== 'undefined' ? window.location.href : 'unknown',
    BASE_PATH: typeof window !== 'undefined' ? window.location.origin : 'unknown',
  });
};

// Utility function to check if we're in production
export const isProduction = (): boolean => ENV.NODE_ENV === 'production';

// Utility function to check if we're in development
export const isDevelopment = (): boolean => ENV.NODE_ENV === 'development';

// Call logEnvironment when importing env.ts to debug connection issues
if (typeof window !== 'undefined' && ENV.DEBUG) {
  console.log('API requests will be sent to:', ENV.API_BASE_URL);
}
