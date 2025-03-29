
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { User, AuthContextType } from '@/types/auth';
import { checkAuthStatus, loginUser, logoutUser } from '@/utils/authUtils';
import { useDatabaseSetup } from '@/hooks/useDatabaseSetup';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Setup database tables when the app loads
  useDatabaseSetup();

  useEffect(() => {
    // Check for authentication cookie on app load
    const checkAuth = async () => {
      try {
        const { authenticated, user } = await checkAuthStatus();
        if (authenticated && user) {
          setUser(user);
          console.log('User authenticated on app load:', user);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (username: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      setLoading(true);
      
      const result = await loginUser(username, password, rememberMe);
      
      if (result.success && result.user) {
        console.log('Login successful, user data:', result.user);
        setUser(result.user);
        
        // Show different message based on user role
        let welcomeMsg = `Welcome back, ${result.user.username}`;
        if (result.user.role === 'super_admin' || result.user.role === 'admin') {
          welcomeMsg += ". You've been redirected to the admin panel.";
        }
        
        toast({
          title: "Login Successful",
          description: welcomeMsg,
        });
        return true;
      } else {
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
      // We removed the call to cleanDummyData to preserve quiz data
      const result = await logoutUser();
      
      // Regardless of API result, clear the user state
      setUser(null);
      
      toast({
        title: "Logged Out",
        description: result.success 
          ? "You have been successfully logged out"
          : "You have been logged out, but there was an error communicating with the server",
      });
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      toast({
        title: "Logged Out",
        description: "You have been logged out",
      });
    }
  };

  // Fix the isAdmin and isSuperAdmin calculations
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isSuperAdmin,
    isAdmin
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

// Re-export User type for convenience
export type { User };
