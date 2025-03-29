
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationLogo } from './NavigationLogo';
import { MobileNavigation } from './MobileNavigation';
import { DesktopNavigation } from './DesktopNavigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Navigation() {
  const { toast } = useToast();
  const { user, logout, isAuthenticated, isSuperAdmin, isAdmin } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
      duration: 3000,
    });
    navigate('/');
  };

  const isCoach = user?.role === 'coach';
  
  // Only show login button for non-authenticated users
  const shouldShowLoginButton = !isAuthenticated;
  
  return (
    <div className="border-b bg-background shadow-sm">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <NavigationLogo />
        
        {isMobile ? (
          <MobileNavigation 
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            isCoach={isCoach}
            user={user}
            onLogout={handleLogout}
          />
        ) : (
          <DesktopNavigation 
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            isCoach={isCoach}
            user={user}
            onLogout={handleLogout}
          />
        )}
      </div>
    </div>
  );
}
