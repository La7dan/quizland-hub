
import { Link } from 'react-router-dom';
import { Shield, User } from 'lucide-react';

interface NavigationLinksProps {
  isAdmin: boolean;
  isCoach: boolean;
  onLinkClick?: () => void;
}

export function NavigationLinks({ isAdmin, isCoach, onLinkClick }: NavigationLinksProps) {
  return (
    <>
      <Link 
        to="/" 
        className="text-sm font-medium transition-colors hover:text-primary"
        onClick={onLinkClick}
      >
        Home
      </Link>
      
      {isAdmin && (
        <Link 
          to="/admin" 
          className="text-sm font-medium transition-colors hover:text-primary ml-4 flex items-center"
          onClick={onLinkClick}
        >
          <Shield className="mr-1 h-4 w-4" />
          Admin Panel
        </Link>
      )}
      
      {isCoach && (
        <Link 
          to="/coach" 
          className="text-sm font-medium transition-colors hover:text-primary ml-4 flex items-center"
          onClick={onLinkClick}
        >
          <User className="mr-1 h-4 w-4" />
          Coach Dashboard
        </Link>
      )}
    </>
  );
}
