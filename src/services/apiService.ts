
import { ENV } from '@/config/env';

// Get API base URL from environment config
const API_BASE_URL = ENV.API_BASE_URL;

// Connection status caching
let lastConnectionCheck = 0;
let cachedConnectionStatus = null;
const CONNECTION_CACHE_TTL = 30000; // 30 seconds

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
    
    console.log(`Making ${method} request to: ${API_BASE_URL}/${cleanEndpoint}`);
    
    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    options.signal = controller.signal;
    
    try {
      const response = await fetch(`${API_BASE_URL}/${cleanEndpoint}`, options);
      clearTimeout(timeoutId);
      
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
      
      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error(`API error (${endpoint}):`, error);
    throw error;
  }
};

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

// Helper to sanitize SQL inputs
const sanitizeSqlString = (value: string): string => {
  if (!value) return '';
  // Replace single quotes with two single quotes to prevent SQL injection
  return value.replace(/'/g, "''");
};

// Execute custom SQL with improved error handling and input sanitization
export const executeSql = async (
  sql: string,
  options?: { timeout?: number, isPublicQuery?: boolean }
): Promise<{ success: boolean; message: string; rows?: any[]; rowCount?: number }> => {
  try {
    console.log('Executing SQL on server:', API_BASE_URL);
    
    // For debugging - log truncated SQL
    const truncatedSql = sql.length > 100 ? sql.substring(0, 100) + '...' : sql;
    console.log('SQL query (truncated):', truncatedSql);
    
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({ 
        sql,
        isPublicQuery: options?.isPublicQuery || false
      }),
    };
    
    // Add timeout if provided
    const timeout = options?.timeout || 15000; // Default to 15 seconds if not specified
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    fetchOptions.signal = controller.signal;
    
    try {
      const response = await fetch(`${API_BASE_URL}/execute-sql`, fetchOptions);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          return { 
            success: false, 
            message: 'Authentication required. Please log in.' 
          };
        }
        
        if (response.status === 403) {
          return { 
            success: false, 
            message: 'Access denied. You do not have sufficient privileges.' 
          };
        }
        
        const errorText = await response.text();
        throw new Error(`Server responded with status ${response.status}: ${errorText || 'Unknown error'}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle abort errors specifically
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: `Request timed out after ${timeout/1000} seconds. The server might be overloaded or unreachable.`
        };
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Execute SQL error:', error);
    return { success: false, message: String(error) };
  }
};

// Utility functions for quizManagementService to prevent SQL errors
export const sqlEscape = {
  string: (value: string | null | undefined): string => {
    if (value === null || value === undefined) return 'NULL';
    return `'${sanitizeSqlString(value)}'`;
  },
  
  number: (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'NULL';
    return value.toString();
  },
  
  boolean: (value: boolean | null | undefined): string => {
    if (value === null || value === undefined) return 'NULL';
    return value ? 'TRUE' : 'FALSE';
  }
};
