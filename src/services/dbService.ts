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

export interface User {
  id?: number;
  username: string;
  password: string; // Note: In a production app, never store plain text passwords
  role: 'super_admin' | 'admin' | 'coach';
  email: string;
  created_at?: string;
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

// Initialize user tables
export const initializeUserTables = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Create users table
    const createUsersTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'admin', 'coach')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    const result = await executeSql(createUsersTableSQL);
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return { success: true, message: 'User tables initialized successfully' };
  } catch (error) {
    console.error('Initialize user tables error:', error);
    return { success: false, message: 'Failed to initialize user tables' };
  }
};

// Get all users
export const getUsers = async (): Promise<{ success: boolean; users: User[]; message?: string }> => {
  try {
    const result = await executeSql('SELECT id, username, email, role, created_at FROM users ORDER BY id');
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return { success: true, users: result.rows || [] };
  } catch (error) {
    console.error('Get users error:', error);
    return { success: false, users: [], message: 'Failed to fetch users' };
  }
};

// Create a new user
export const createUser = async (user: User): Promise<{ success: boolean; message: string; userId?: number }> => {
  try {
    const { username, password, email, role } = user;
    
    const sql = `
      INSERT INTO users (username, password, email, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    
    const result = await executeSql(`
      INSERT INTO users (username, password, email, role)
      VALUES ('${username}', '${password}', '${email}', '${role}')
      RETURNING id;
    `);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    const userId = result.rows && result.rows[0] ? result.rows[0].id : undefined;
    
    return { 
      success: true, 
      message: 'User created successfully', 
      userId 
    };
  } catch (error) {
    console.error('Create user error:', error);
    return { success: false, message: `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

// Update user
export const updateUser = async (user: User): Promise<{ success: boolean; message: string }> => {
  try {
    if (!user.id) {
      throw new Error('User ID is required for update');
    }
    
    const updateFields = [];
    const values = [];
    
    if (user.username) updateFields.push(`username = '${user.username}'`);
    if (user.email) updateFields.push(`email = '${user.email}'`);
    if (user.role) updateFields.push(`role = '${user.role}'`);
    if (user.password) updateFields.push(`password = '${user.password}'`);
    
    if (updateFields.length === 0) {
      return { success: true, message: 'No fields to update' };
    }
    
    const sql = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = ${user.id};
    `;
    
    const result = await executeSql(sql);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return { success: true, message: 'User updated successfully' };
  } catch (error) {
    console.error('Update user error:', error);
    return { success: false, message: `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

// Delete user
export const deleteUser = async (userId: number): Promise<{ success: boolean; message: string }> => {
  try {
    const result = await executeSql(`DELETE FROM users WHERE id = ${userId};`);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, message: `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};
