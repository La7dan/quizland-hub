import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '@/types/auth';

// Enhanced types for the login form
export interface LoginFormData {
  username: string;
  password: string;
}

export interface LoginHistory {
  time: string;
  location: string;
}

export interface UseLoginFormReturn {
  register: ReturnType<typeof useForm<LoginFormData>>['register'];
  handleSubmit: ReturnType<typeof useForm<LoginFormData>>['handleSubmit'];
  onSubmit: (data: LoginFormData) => Promise<void>;
  errors: ReturnType<typeof useForm<LoginFormData>>['formState']['errors'];
  loginError: string | null;
  isLoggingIn: boolean;
  lastLogin: LoginHistory | null;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  lockoutTime: number | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  user: User | null;
  from: string;
  loginWithAdminCredentials: () => Promise<void>;
}

export const useLoginForm = (): UseLoginFormReturn => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [lastLogin, setLastLogin] = useState<LoginHistory | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const { login, isAuthenticated, isSuperAdmin, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || 
               (isSuperAdmin || isAdmin ? '/admin' : 
               (user?.role === 'coach' ? '/coach' : '/'));

  console.log('LoginPage - Auth status:', { isAuthenticated, userRole: user?.role, isAdmin, isSuperAdmin, from });
  
  useEffect(() => {
    try {
      const storedLoginHistory = localStorage.getItem('loginHistory');
      if (storedLoginHistory) {
        const parsedHistory = JSON.parse(storedLoginHistory) as LoginHistory;
        setLastLogin(parsedHistory);
      }
      
      const storedAttempts = localStorage.getItem('loginAttempts');
      if (storedAttempts) {
        const attempts = parseInt(storedAttempts, 10);
        if (!isNaN(attempts)) {
          setLoginAttempts(attempts);
        }
      }
      
      const storedLockoutTime = localStorage.getItem('lockoutUntil');
      if (storedLockoutTime) {
        const lockoutUntil = parseInt(storedLockoutTime, 10);
        if (!isNaN(lockoutUntil)) {
          const now = Date.now();
          
          if (lockoutUntil > now) {
            const remainingTime = Math.ceil((lockoutUntil - now) / 1000);
            setLockoutTime(remainingTime);
            
            const timer = setInterval(() => {
              setLockoutTime(prev => {
                if (prev && prev > 1) {
                  return prev - 1;
                } else {
                  clearInterval(timer);
                  localStorage.removeItem('lockoutUntil');
                  return null;
                }
              });
            }, 1000);
            
            return () => clearInterval(timer);
          } else {
            localStorage.removeItem('lockoutUntil');
          }
        }
      }
    } catch (error) {
      console.error('Error loading login data from localStorage:', error);
      localStorage.removeItem('loginHistory');
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('lockoutUntil');
    }
  }, []);

  const handleLoginSuccess = (): void => {
    setLoginAttempts(0);
    localStorage.removeItem('loginAttempts');
    
    try {
      const now = new Date().toLocaleString();
      const loginInfo: LoginHistory = {
        time: now,
        location: 'Your current location'
      };
      
      localStorage.setItem('loginHistory', JSON.stringify(loginInfo));
    } catch (error) {
      console.error('Error saving login history:', error);
    }
  };

  const handleLoginFailure = (): void => {
    try {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('loginAttempts', newAttempts.toString());
      
      if (newAttempts >= 3) {
        const lockoutDuration = 30;
        const lockoutUntil = Date.now() + (lockoutDuration * 1000);
        
        localStorage.setItem('lockoutUntil', lockoutUntil.toString());
        setLockoutTime(lockoutDuration);
        
        setLoginError(`Too many failed login attempts. Your account is locked for ${lockoutDuration} seconds.`);
      } else {
        setLoginError(`Login failed. Please check your credentials. ${3 - newAttempts} attempts remaining.`);
      }
    } catch (error) {
      console.error('Error handling login failure:', error);
      setLoginError('Login failed. Please check your credentials.');
    }
  };

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    try {
      setLoginError(null);
      
      if (lockoutTime !== null) {
        setLoginError(`Account is temporarily locked. Please try again in ${lockoutTime} seconds.`);
        return;
      }
      
      setIsLoggingIn(true);
      
      console.log('Login form submitted:', {
        username: data.username,
        password: '********',
        rememberMe
      });
      
      const success = await login(data.username, data.password, rememberMe);
      
      console.log('Login result:', success ? 'success' : 'failed');
      
      if (success) {
        handleLoginSuccess();
      } else {
        handleLoginFailure();
      }
    } catch (error) {
      console.error('Login submission error:', error);
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loginWithAdminCredentials = async (): Promise<void> => {
    try {
      setLoginError(null);
      
      if (lockoutTime !== null) {
        setLoginError(`Account is temporarily locked. Please try again in ${lockoutTime} seconds.`);
        return;
      }
      
      setIsLoggingIn(true);
      
      console.log('Attempting quick login with admin credentials');
      
      const success = await login('admin', 'admin123', rememberMe);
      
      console.log('Admin login result:', success ? 'success' : 'failed');
      
      if (success) {
        handleLoginSuccess();
      } else {
        handleLoginFailure();
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    loginError,
    isLoggingIn,
    lastLogin,
    rememberMe,
    setRememberMe,
    lockoutTime,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    user,
    from,
    loginWithAdminCredentials
  };
};
