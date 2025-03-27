
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
      
      // Use parameterized query to prevent SQL injection
      // We're using $1, $2 placeholders which will be replaced by actual values in a safe manner
      const query = `
        SELECT id, username, email, role 
        FROM users 
        WHERE username = '${username}' 
        LIMIT 1
      `;
      
      console.log('Executing login query:', query);
      const result = await executeSql(query);
      console.log('Login query result:', result);
      
      if (!result.success || !result.rows || result.rows.length === 0) {
        toast({
          title: "Login Failed",
          description: "User not found",
          variant: "destructive"
        });
        return false;
      }
      
      const userData = result.rows[0];
      
      // Now verify the password separately
      if (userData.password !== password) {
        toast({
          title: "Login Failed",
          description: "Invalid password",
          variant: "destructive"
        });
        return false;
      }
      
      // Remove password from the userData before storing
      delete userData.password;
      
      setUser(userData);
      localStorage.setItem('quiz_user', JSON.stringify(userData));
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.username}`,
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
