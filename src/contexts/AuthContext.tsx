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

// Custom API URL for auth endpoints
const AUTH_API_URL = 'https://209.74.89.41:8080/api/auth';

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
    // Check for authentication cookie on app load
    const checkAuth = async () => {
      try {
        console.log('Checking authentication status...');
        const response = await fetch(`${AUTH_API_URL}/check`, {
          credentials: 'include', // Important for cookies
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Auth check response:', data);
          if (data.authenticated && data.user) {
            setUser(data.user);
          }
        } else {
          console.log('Auth check failed with status:', response.status);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Login attempt for user:', username);
      
      // Call the server's login API endpoint
      const response = await fetch(`${AUTH_API_URL}/login`, {
        method: 'POST',
        credentials: 'include', // Important for cookies
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login failed with status:', response.status, errorData);
        toast({
          title: "Login Failed",
          description: errorData.message || "Invalid credentials",
          variant: "destructive"
        });
        return false;
      }
      
      const result = await response.json();
      console.log('Login response:', result);
      
      if (result.success) {
        console.log('Login successful', result.user);
        setUser(result.user);
        
        // Show different message based on user role
        let welcomeMsg = `Welcome back, ${result.user.username}`;
        if (result.user.role === 'super_admin') {
          welcomeMsg += ". You've been redirected to the admin panel.";
        }
        
        toast({
          title: "Login Successful",
          description: welcomeMsg,
        });
        return true;
      } else {
        console.log('Login failed:', result.message);
        toast({
          title: "Login Failed",
          description: result.message || "Invalid credentials",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please check your network connection.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout API endpoint to clear the cookie
      const response = await fetch(`${AUTH_API_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      const result = await response.json();
      console.log('Logout response:', result);
      
      setUser(null);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, clear the user state
      setUser(null);
    }
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
