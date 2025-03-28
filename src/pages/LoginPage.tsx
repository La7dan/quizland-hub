
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useLoginForm } from '@/hooks/useLoginForm';
import Navigation from '@/components/Navigation';
import LoginCard from '@/components/login/LoginCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, LogIn } from 'lucide-react';

const LoginPage = () => {
  const {
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
    from,
    loginWithAdminCredentials
  } = useLoginForm();
  
  const isMobile = useIsMobile();
  
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

  return (
    <>
      <Navigation />
      <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 sm:px-6">
        <div className="flex flex-col w-full max-w-md space-y-4">
          <Alert variant="info" className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-2">
              <div>
                Default admin credentials: username: <strong>admin</strong>, password: <strong>admin123</strong>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-1 border-blue-300 hover:bg-blue-50"
                onClick={loginWithAdminCredentials}
                disabled={isLoggingIn}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Quick Login as Admin
              </Button>
            </AlertDescription>
          </Alert>
          
          <LoginCard
            lastLogin={lastLogin}
            register={register}
            errors={errors}
            loginError={loginError}
            lockoutTime={lockoutTime}
            isLoggingIn={isLoggingIn}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            onSubmit={handleSubmit(onSubmit)}
          />
        </div>
      </div>
    </>
  );
};

export default LoginPage;
