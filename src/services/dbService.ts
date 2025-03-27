// API base URL - always pointing to the database server IP
const API_BASE_URL = 'http://209.74.89.41:5000/api';

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
    console.log(`Connecting to: ${API_BASE_URL}/check-connection`);
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
    console.log(`Clearing table: ${tableName}`);
    const response = await fetch(`${API_BASE_URL}/tables/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName }),
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Clear table response:', data);
    return data;
  } catch (error) {
    console.error(`Clear table error for ${tableName}:`, error);
    return { success: false, message: `Failed to clear table ${tableName}` };
  }
};

// Clear all tables
export const clearAllTables = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Clearing all tables');
    const response = await fetch(`${API_BASE_URL}/tables/clear-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Clear all tables response:', data);
    return data;
  } catch (error) {
    console.error('Clear all tables error:', error);
    return { success: false, message: 'Failed to clear all tables' };
  }
};

// Delete a table
export const deleteTable = async (tableName: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`Deleting table: ${tableName}`);
    const response = await fetch(`${API_BASE_URL}/tables/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName }),
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Delete table response:', data);
    return data;
  } catch (error) {
    console.error(`Delete table error for ${tableName}:`, error);
    return { success: false, message: `Failed to delete table ${tableName}` };
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
