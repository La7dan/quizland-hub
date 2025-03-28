
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

// Custom API URL for auth endpoints - using HTTP as requested by the user
const AUTH_API_URL = 'http://209.74.89.41:8080/api/auth';

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
          // Show toast only if it's a real error, not just a warning about tables already existing
          if (!result.message?.includes('already exists')) {
            toast({
              title: "Database Setup Warning",
              description: "Some database tables could not be fully initialized. Application may have limited functionality.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Error setting up database:', error);
        // Don't show error toast during initialization to avoid confusion
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
          // For 401 or 403, this is expected for unauthenticated users, so don't show an error
          if (response.status !== 401 && response.status !== 403) {
            console.error('Unexpected auth check response:', response.status);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Don't show toast for auth errors on page load to avoid confusion
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
        // Try to get error message from response
        let errorMessage = "Invalid credentials";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        console.error('Login failed with status:', response.status, errorMessage);
        toast({
          title: "Login Failed",
          description: errorMessage,
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
        description: "An error occurred during login. Please check your connection and try again.",
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
      
      // Even if there's an error, we'll still clear the local user state
      try {
        const result = await response.json();
        console.log('Logout response:', result);
      } catch (e) {
        console.log('Logout completed (no response data)');
      }
      
      setUser(null);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, clear the user state
      setUser(null);
      
      toast({
        title: "Logged Out",
        description: "You have been logged out, but there was an error communicating with the server",
      });
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
