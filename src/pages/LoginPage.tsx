
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
    user,
    from
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
