import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { executeSql } from '@/services/dbService';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'coach';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Setup database tables when the app loads
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        console.log('Setting up database tables...');
        // Fetch the SQL file content
        const response = await fetch('/src/assets/db-setup.sql');
        const sqlContent = await response.text();
        
        // Execute SQL to set up all tables
        console.log('Executing database setup SQL...');
        const result = await executeSql(sqlContent);
        
        if (result.success) {
          console.log('Database setup completed successfully');
        } else {
          console.error('Database setup failed:', result.message);
        }
      } catch (error) {
        console.error('Error setting up database:', error);
      }
    };
    
    setupDatabase();
  }, []);

  useEffect(() => {
    // Check for saved user in localStorage on app load
    const savedUser = localStorage.getItem('quiz_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        localStorage.removeItem('quiz_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Login attempt for user:', username);
      
      // First check if user exists and get user data including password
      // Escape single quotes to prevent SQL injection
      const safeUsername = username.replace(/'/g, "''");
      
      const query = `
        SELECT id, username, email, role, password 
        FROM users 
        WHERE username = '${safeUsername}' 
        LIMIT 1
      `;
      
      console.log('Executing login query');
      const result = await executeSql(query);
      console.log('Login query result received:', result);
      
      // Check if user exists and if the query was successful
      if (!result.success) {
        console.error('SQL execution failed:', result.message);
        toast({
          title: "Login Failed",
          description: "Database error occurred: " + result.message,
          variant: "destructive"
        });
        return false;
      }
      
      if (!result.rows || result.rows.length === 0) {
        console.log('No user found with username:', username);
        toast({
          title: "Login Failed",
          description: "User not found",
          variant: "destructive"
        });
        return false;
      }
      
      const userData = result.rows[0];
      console.log('User found, checking password');
      
      // Debug: Log password comparison (for development only, remove in production)
      console.log('Input password:', password);
      console.log('Stored password:', userData.password);
      
      // Verify the password
      if (userData.password !== password) {
        console.log('Password mismatch');
        toast({
          title: "Login Failed",
          description: "Invalid password",
          variant: "destructive"
        });
        return false;
      }
      
      console.log('Password verified, login successful');
      
      // Create a clean user object without the password
      const cleanUserData = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role
      };
      
      setUser(cleanUserData);
      localStorage.setItem('quiz_user', JSON.stringify(cleanUserData));
      
      // Show different message based on user role
      let welcomeMsg = `Welcome back, ${cleanUserData.username}`;
      if (cleanUserData.role === 'super_admin') {
        welcomeMsg += ". You've been redirected to the admin panel.";
      }
      
      toast({
        title: "Login Successful",
        description: welcomeMsg,
      });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An error occurred during login",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('quiz_user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'super_admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
