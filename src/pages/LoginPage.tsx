
import { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Shield, LogIn, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from '@/components/Navigation';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { login, isAuthenticated, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to home
  const from = (location.state as any)?.from?.pathname || '/';
  
  // If already authenticated and trying to access admin panel
  if (isAuthenticated && from.includes('/admin') && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }
  
  // If already authenticated, redirect to the intended page
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setLoginError('Username and password are required');
      return;
    }
    
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const success = await login(username, password);
      if (success) {
        navigate(from, { replace: true });
      } else {
        // Login will display its own toast, but we also set this for form validation
        setLoginError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      setLoginError('An error occurred during login');
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div>
      <Navigation />
      <div className="container mx-auto flex justify-center items-center min-h-[calc(100vh-4rem)] py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-3">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Login to your account</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the platform
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging In...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
