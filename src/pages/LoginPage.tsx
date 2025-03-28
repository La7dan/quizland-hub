
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Shield, LogIn, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from '@/components/Navigation';
import DatabaseSetupButton from '@/components/DatabaseSetupButton';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, isAuthenticated, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to admin panel for superadmin
  const from = (location.state as any)?.from?.pathname || (isSuperAdmin ? '/admin' : '/');
  
  // If already authenticated and trying to access admin panel
  if (isAuthenticated && from.includes('/admin') && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }
  
  // If already authenticated, redirect to the intended page
  if (isAuthenticated) {
    // If super admin, redirect to admin panel
    if (isSuperAdmin) {
      return <Navigate to="/admin" replace />;
    }
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
        // If login is successful and user is super_admin, redirect to admin panel
        if (isSuperAdmin) {
          navigate('/admin', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        // Login will display its own toast, but we also set this for form validation
        setLoginError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login submission error:', error);
      setLoginError('An unexpected error occurred.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="container flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="flex flex-col w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-primary" />
                  Login
                </CardTitle>
                <DatabaseSetupButton />
              </div>
              <CardDescription>
                Enter your credentials to access the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  {...register("username", { required: true })}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">Username is required</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password", { required: true })}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">Password is required</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
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
            <CardFooter className="border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                <strong>Note:</strong> Sample users will be created when you click "Setup Database" 
                (username: superadmin, password: password123)
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
