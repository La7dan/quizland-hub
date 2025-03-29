
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useLoginForm } from '@/hooks/useLoginForm';
import Navigation from '@/components/Navigation';
import LoginCard from '@/components/login/LoginCard';
import { useIsMobile } from '@/hooks/use-mobile';

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
    isAdmin,
    user,
    from
  } = useLoginForm();
  
  const isMobile = useIsMobile();
  
  // If already authenticated and trying to access admin panel
  if (isAuthenticated && from.includes('/admin') && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  // If already authenticated, redirect to the appropriate page
  if (isAuthenticated) {
    // If super admin or admin, redirect to admin panel
    if (isSuperAdmin || (user?.role === 'admin')) {
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/5">
      <Navigation />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
          </div>
          
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
    </div>
  );
};

export default LoginPage;
