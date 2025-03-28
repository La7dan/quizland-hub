
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

export interface LoginFormData {
  username: string;
  password: string;
}

export const useLoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [lastLogin, setLastLogin] = useState<{ time: string, location: string } | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const { login, isAuthenticated, isSuperAdmin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default based on user role
  const from = (location.state as any)?.from?.pathname || 
               (isSuperAdmin ? '/admin' : 
               (user?.role === 'coach' ? '/coach' : '/'));
  
  console.log('LoginPage - Auth status:', { isAuthenticated, userRole: user?.role, from });
  
  // Fetch last login info and login attempts from localStorage on component mount
  useEffect(() => {
    const storedLoginHistory = localStorage.getItem('loginHistory');
    if (storedLoginHistory) {
      try {
        const parsedHistory = JSON.parse(storedLoginHistory);
        setLastLogin(parsedHistory);
      } catch (error) {
        console.error('Error parsing login history:', error);
      }
    }
    
    // Get stored login attempts and lockout time
    const storedAttempts = localStorage.getItem('loginAttempts');
    const storedLockoutTime = localStorage.getItem('lockoutUntil');
    
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }
    
    if (storedLockoutTime) {
      const lockoutUntil = parseInt(storedLockoutTime);
      const now = Date.now();
      
      if (lockoutUntil > now) {
        // Still in lockout period
        setLockoutTime(Math.ceil((lockoutUntil - now) / 1000));
        
        // Set timer to update remaining lockout time
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
        // Lockout period has expired
        localStorage.removeItem('lockoutUntil');
        setLockoutTime(null);
      }
    }
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginError(null);
      
      // Check if account is locked out
      if (lockoutTime !== null) {
        setLoginError(`Account is temporarily locked. Please try again in ${lockoutTime} seconds.`);
        return;
      }
      
      setIsLoggingIn(true);
      
      console.log('Login form submitted:', {
        username: data.username,
        password: '********', // Don't log the actual password
        rememberMe
      });
      
      const success = await login(data.username, data.password, rememberMe);
      
      console.log('Login result:', success ? 'success' : 'failed');
      
      if (success) {
        // Reset login attempts on successful login
        setLoginAttempts(0);
        localStorage.removeItem('loginAttempts');
        
        // Store login time and approximate location on successful login
        const now = new Date().toLocaleString();
        // In a real app, you might use a geolocation API here
        // For this example, we'll use a placeholder
        const loginInfo = {
          time: now,
          location: 'Your current location'
        };
        
        localStorage.setItem('loginHistory', JSON.stringify(loginInfo));
        // Login was successful - the redirect will happen automatically 
        // when the AuthContext sets the user state
      } else {
        // Increment failed login attempts
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('loginAttempts', newAttempts.toString());
        
        // Check if we should lock the account (after 3 failed attempts)
        if (newAttempts >= 3) {
          const lockoutDuration = 30; // seconds
          const lockoutUntil = Date.now() + (lockoutDuration * 1000);
          
          localStorage.setItem('lockoutUntil', lockoutUntil.toString());
          setLockoutTime(lockoutDuration);
          
          setLoginError(`Too many failed login attempts. Your account is locked for ${lockoutDuration} seconds.`);
        } else {
          // Login will display its own toast, but we also set this for form validation
          setLoginError(`Login failed. Please check your credentials. ${3 - newAttempts} attempts remaining.`);
        }
      }
    } catch (error) {
      console.error('Login submission error:', error);
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
    user,
    from
  };
};
