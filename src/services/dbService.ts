
// API base URL - adjust if your server is running on a different port
const API_BASE_URL = 'http://localhost:5000/api';

export interface TableColumn {
  name: string;
  type: string;
  constraints?: string;
}

export interface DBTable {
  table_name: string;
}

// Check database connection
export const checkConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/check-connection`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Connection check error:', error);
    return { success: false, message: 'Failed to connect to the server' };
  }
};

// Get all tables
export const getTables = async (): Promise<{ success: boolean; tables: DBTable[]; message?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get tables error:', error);
    return { success: false, tables: [], message: 'Failed to fetch tables' };
  }
};

// Clear a specific table
export const clearTable = async (tableName: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Clear table error for ${tableName}:`, error);
    return { success: false, message: `Failed to clear table ${tableName}` };
  }
};

// Clear all tables
export const clearAllTables = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/clear-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Clear all tables error:', error);
    return { success: false, message: 'Failed to clear all tables' };
  }
};

// Create a new table
export const createTable = async (
  tableName: string, 
  columns: TableColumn[]
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName, columns }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Create table error for ${tableName}:`, error);
    return { success: false, message: `Failed to create table ${tableName}` };
  }
};

// Execute custom SQL
export const executeSql = async (
  sql: string
): Promise<{ success: boolean; message: string; rows?: any[]; rowCount?: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/execute-sql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Execute SQL error:', error);
    return { success: false, message: 'Failed to execute SQL' };
  }
};
