
import { ENV } from '@/config/env';

// Helper to sanitize SQL inputs
const sanitizeSqlString = (value: string): string => {
  if (!value) return '';
  // Replace single quotes with two single quotes to prevent SQL injection
  return value.replace(/'/g, "''");
};

// Updated type definition to include params
interface SqlExecuteOptions {
  timeout?: number;
  isPublicQuery?: boolean;
  params?: any[];
}

// Execute custom SQL with improved error handling and input sanitization
export const executeSql = async (
  sql: string,
  options?: SqlExecuteOptions
): Promise<{ success: boolean; message: string; rows?: any[]; rowCount?: number }> => {
  try {
    console.log('Executing SQL on server');
    
    // For debugging - log truncated SQL
    const truncatedSql = sql.length > 100 ? sql.substring(0, 100) + '...' : sql;
    console.log('SQL query (truncated):', truncatedSql);
    
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({ 
        sql,
        isPublicQuery: options?.isPublicQuery || false,
        params: options?.params || []  // Pass parameters to server
      }),
    };
    
    // Add timeout if provided
    const timeout = options?.timeout || 15000; // Default to 15 seconds if not specified
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    fetchOptions.signal = controller.signal;
    
    try {
      // Use relative URL instead of hardcoded URL
      const response = await fetch(`/api/database/execute-sql`, fetchOptions);
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

// Utility functions for SQL escaping to prevent SQL errors
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
