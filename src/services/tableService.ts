
import { callApi, executeSql } from './apiService';

export interface TableColumn {
  name: string;
  type: string;
  constraints?: string;
}

export interface DBTable {
  table_name: string;
}

// Get all tables
export const getTables = async (): Promise<{ success: boolean; tables: DBTable[]; message?: string }> => {
  try {
    const response = await fetch(`http://209.74.89.41/api/tables`);
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
    const response = await fetch(`http://209.74.89.41/api/tables/clear`, {
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
    const response = await fetch(`http://209.74.89.41/api/tables/clear-all`, {
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
    const response = await fetch(`http://209.74.89.41/api/tables/delete`, {
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
    const response = await fetch(`http://209.74.89.41/api/tables/create`, {
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
