
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
    // Add the superadmin user if not exists
    const addSuperAdmin = async () => {
      try {
        // Check if the user already exists
        const checkQuery = `
          SELECT COUNT(*) as count 
          FROM users 
          WHERE username = 'la7dan'
        `;
        
        const checkResult = await executeSql(checkQuery);
        
        if (checkResult.success && checkResult.rows && checkResult.rows[0].count === '0') {
          // User doesn't exist, add it
          const insertQuery = `
            INSERT INTO users (username, password, email, role)
            VALUES ('la7dan', 'Lal@13161', 'la7dan@example.com', 'super_admin')
          `;
          
          await executeSql(insertQuery);
          console.log('Superadmin user added successfully');
        } else {
          console.log('Superadmin user already exists');
        }
      } catch (error) {
        console.error('Error adding superadmin user:', error);
      }
    };
    
    // Call the function to add superadmin
    addSuperAdmin();

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
      
      // First check if user exists and get user data including password
      // Escape single quotes to prevent SQL injection
      const safeUsername = username.replace(/'/g, "''");
      
      const query = `
        SELECT id, username, email, role, password 
        FROM users 
        WHERE username = '${safeUsername}' 
        LIMIT 1
      `;
      
      console.log('Executing login query:', query);
      const result = await executeSql(query);
      console.log('Login query result:', result);
      
      // Check if user exists
      if (!result.success || !result.rows || result.rows.length === 0) {
        toast({
          title: "Login Failed",
          description: "User not found",
          variant: "destructive"
        });
        return false;
      }
      
      const userData = result.rows[0];
      
      // Verify the password
      if (userData.password !== password) {
        toast({
          title: "Login Failed",
          description: "Invalid password",
          variant: "destructive"
        });
        return false;
      }
      
      // Create a clean user object without the password
      const cleanUserData = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role
      };
      
      setUser(cleanUserData);
      localStorage.setItem('quiz_user', JSON.stringify(cleanUserData));
      toast({
        title: "Login Successful",
        description: `Welcome back, ${cleanUserData.username}`,
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
