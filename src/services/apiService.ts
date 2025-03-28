
import { ENV } from '@/config/env';

// Get API base URL from environment config
const API_BASE_URL = ENV.API_BASE_URL;

// Base API call function
export const callApi = async <T>(
  endpoint: string, 
  method: 'GET' | 'POST' = 'GET', 
  body?: any
): Promise<T> => {
  try {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    // Ensure endpoint doesn't start with a slash to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    console.log(`Making ${method} request to: ${API_BASE_URL}/${cleanEndpoint}`);
    const response = await fetch(`${API_BASE_URL}/${cleanEndpoint}`, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorText || response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API error (${endpoint}):`, error);
    throw error;
  }
};

// Check database connection
export const checkConnection = async (): Promise<{ success: boolean; message: string; cached?: boolean }> => {
  try {
    console.log(`Connecting to: ${API_BASE_URL}/check-connection`);
    const response = await fetch(`${API_BASE_URL}/check-connection`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Connection check error:', error);
    return { success: false, message: 'Failed to connect to the server' };
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
  sql: string
): Promise<{ success: boolean; message: string; rows?: any[]; rowCount?: number }> => {
  try {
    console.log('Executing SQL on server:', API_BASE_URL);
    
    // For debugging - log truncated SQL
    const truncatedSql = sql.length > 100 ? sql.substring(0, 100) + '...' : sql;
    console.log('SQL query (truncated):', truncatedSql);
    
    const response = await fetch(`${API_BASE_URL}/execute-sql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with status ${response.status}: ${errorText || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data;
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
