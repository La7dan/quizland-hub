import { executeSql } from './apiService';

export interface User {
  id?: number;
  username: string;
  password: string; // Note: In a production app, never store plain text passwords
  role: 'super_admin' | 'admin' | 'coach';
  email: string;
  created_at?: string;
}

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

// Add a function to create multiple users at once
export const createManyUsers = async (users: User[]): Promise<{ success: boolean; count?: number; message?: string }> => {
  try {
    // Generate SQL with multiple INSERT statements
    const valueStrings = users.map(user => {
      const username = user.username.replace(/'/g, "''");
      const password = user.password.replace(/'/g, "''");
      const email = user.email.replace(/'/g, "''");
      const role = user.role || 'coach';
      
      return `('${username}', '${password}', '${email}', '${role}')`;
    });
    
    if (valueStrings.length === 0) {
      return { success: false, message: 'No valid users to import' };
    }
    
    // Use a transaction for the batch insert
    const result = await executeSql(`
      WITH imported_users AS (
        INSERT INTO users (username, password, email, role)
        VALUES ${valueStrings.join(',\n')}
        ON CONFLICT (username) DO UPDATE
        SET password = EXCLUDED.password,
            email = EXCLUDED.email,
            role = EXCLUDED.role
        RETURNING id
      )
      SELECT COUNT(*) as count FROM imported_users;
    `);
    
    if (result.success && result.rows?.length) {
      const count = parseInt(result.rows[0].count);
      return { success: true, count };
    } else {
      return { success: false, message: result.message || 'Unknown error occurred' };
    }
  } catch (error) {
    console.error('Error creating multiple users:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};
