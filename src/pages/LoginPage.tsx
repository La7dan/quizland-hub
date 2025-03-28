
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Shield, LogIn, AlertCircle, Clock, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from '@/components/Navigation';
import { useIsMobile } from '@/hooks/use-mobile';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [lastLogin, setLastLogin] = useState<{ time: string, location: string } | null>(null);
  const { login, isAuthenticated, isSuperAdmin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Get the redirect path from location state or default based on user role
  const from = (location.state as any)?.from?.pathname || 
               (isSuperAdmin ? '/admin' : 
               (user?.role === 'coach' ? '/coach' : '/'));
  
  console.log('LoginPage - Auth status:', { isAuthenticated, userRole: user?.role, from });
  
  // Fetch last login info from localStorage on component mount
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
  }, []);
  
  // If already authenticated and trying to access admin panel
  if (isAuthenticated && from.includes('/admin') && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }
  
  // If already authenticated, redirect to the appropriate page
  if (isAuthenticated) {
    // If super admin, redirect to admin panel
    if (isSuperAdmin) {
      return <Navigate to="/admin" replace />;
    }
    // If coach, redirect to coach dashboard
    if (user?.role === 'coach') {
      return <Navigate to="/coach" replace />;
    }
    // For other users, redirect to the intended page
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: any) => {
    try {
      setLoginError(null);
      setIsLoggingIn(true);
      
      console.log('Login form submitted:', {
        username: data.username,
        password: '********' // Don't log the actual password
      });
      
      const success = await login(data.username, data.password);
      
      console.log('Login result:', success ? 'success' : 'failed');
      
      if (success) {
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
        // Login will display its own toast, but we also set this for form validation
        setLoginError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login submission error:', error);
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="container flex items-center justify-center min-h-[calc(100vh-64px)] px-4 sm:px-6">
        <div className="flex flex-col w-full max-w-md">
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                Login
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Enter your credentials to access the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lastLogin && (
                <div className="text-sm text-muted-foreground mb-4 border border-border rounded-md p-3 bg-secondary/20">
                  <div className="flex items-center mb-1 text-xs sm:text-sm font-medium">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    Last login time:
                  </div>
                  <p className="pl-5 text-xs sm:text-sm">{lastLogin.time}</p>
                  <div className="flex items-center mt-2 mb-1 text-xs sm:text-sm font-medium">
                    <MapPin className="h-3.5 w-3.5 mr-1.5" />
                    Location:
                  </div>
                  <p className="pl-5 text-xs sm:text-sm">{lastLogin.location}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm sm:text-base">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  className="h-9 sm:h-10 text-sm sm:text-base"
                  {...register("username", { required: true })}
                />
                {errors.username && (
                  <p className="text-xs sm:text-sm text-red-500">Username is required</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="h-9 sm:h-10 text-sm sm:text-base"
                  {...register("password", { required: true })}
                />
                {errors.password && (
                  <p className="text-xs sm:text-sm text-red-500">Password is required</p>
                )}
              </div>
              
              <Button type="submit" className="w-full mt-2" disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
              </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
