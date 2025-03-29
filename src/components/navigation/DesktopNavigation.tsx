
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavigationLinks } from './NavigationLinks';
import { UserDropdownMenu } from './UserDropdownMenu';

interface DesktopNavigationProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCoach: boolean;
  user: { username: string; role: string; } | null;
  onLogout: () => void;
}

export function DesktopNavigation({ 
  isAuthenticated, 
  isAdmin, 
  isCoach, 
  user, 
  onLogout 
}: DesktopNavigationProps) {
  const navigate = useNavigate();
  
  return (
    <nav className="ml-auto flex items-center gap-4">
      <NavigationLinks isAdmin={isAdmin} isCoach={isCoach} />
      
      {isAuthenticated ? (
        <UserDropdownMenu user={user} onLogout={onLogout} />
      ) : (
        <Button onClick={() => navigate('/login')} className="ml-4" variant="default">
          Login
        </Button>
      )}
    </nav>
  );
}
