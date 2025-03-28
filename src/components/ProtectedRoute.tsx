
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireSuperAdmin = false, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // Log authentication status for debugging
    console.log('ProtectedRoute - Auth Status:', { 
      isAuthenticated, 
      userRole: user?.role,
      requireSuperAdmin,
      requireAdmin,
      currentPath: location.pathname
    });
  }, [isAuthenticated, user, requireSuperAdmin, requireAdmin, location]);
  
  // If still loading authentication state, show loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check for super admin access if required
  if (requireSuperAdmin && user?.role !== 'super_admin') {
    console.log('Not a super admin, redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  // Check for admin access if required (both admin and super_admin roles qualify)
  if (requireAdmin && user?.role !== 'super_admin' && user?.role !== 'admin') {
    console.log('Not an admin, redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  // User is authenticated and has proper permissions
  return <>{children}</>;
};

export default ProtectedRoute;
