
import { executeSql } from './apiService';
import { ENV } from '@/config/env';

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
    
    // In a real app, we would hash passwords here before storing
    // But for simplicity in this demo, we'll store it directly
    
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
    // Call the server API to import users
    const response = await fetch(`${ENV.API_BASE_URL}/users/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important for auth cookies
      body: JSON.stringify({ users })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorText || response.statusText}`);
    }
    
    const result = await response.json();
    
    return { 
      success: result.success, 
      count: result.successCount,
      message: result.message
    };
  } catch (error) {
    console.error('Error creating multiple users:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};

// Add a user verification function to help with debugging
export const verifyUserLogin = async (username: string, password: string): Promise<{ 
  success: boolean; 
  message: string;
  user?: { id: number; username: string; role: string; email: string; }
}> => {
  try {
    const result = await executeSql(`
      SELECT id, username, role, email, password 
      FROM users 
      WHERE username = '${username}'
    `);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    if (!result.rows || result.rows.length === 0) {
      return { success: false, message: 'User not found' };
    }
    
    const user = result.rows[0];
    
    // Check if password matches (basic check for demo purposes)
    if (user.password !== password) {
      return { success: false, message: 'Invalid password' };
    }
    
    return { 
      success: true, 
      message: 'User verified successfully',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      }
    };
  } catch (error) {
    console.error('Verify user error:', error);
    return { success: false, message: `Failed to verify user: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};
