
// API base URL - use environment variable or default to localhost in development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

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

    console.log(`Making ${method} request to: ${API_BASE_URL}/${endpoint}`);
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API error (${endpoint}):`, error);
    throw error;
  }
};

// Check database connection
export const checkConnection = async (): Promise<{ success: boolean; message: string }> => {
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

// Execute custom SQL
export const executeSql = async (
  sql: string
): Promise<{ success: boolean; message: string; rows?: any[]; rowCount?: number }> => {
  try {
    console.log('Executing SQL on server:', API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/execute-sql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql }),
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Execute SQL error:', error);
    return { success: false, message: 'Failed to execute SQL' };
  }
};
