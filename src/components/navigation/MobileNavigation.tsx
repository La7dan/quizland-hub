
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, X, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavigationLinks } from './NavigationLinks';
import { getUserRoleStyles } from './navigationUtils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MobileNavigationProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCoach: boolean;
  user: { username: string; role: string; } | null;
  onLogout: () => void;
}

export function MobileNavigation({ 
  isAuthenticated, 
  isAdmin, 
  isCoach, 
  user, 
  onLogout 
}: MobileNavigationProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
  };
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="ml-auto"
    >
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-auto">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="absolute top-16 left-0 right-0 z-50 bg-background border-b p-4 shadow-md">
        <div className="flex flex-col space-y-3">
          <NavigationLinks 
            isAdmin={isAdmin} 
            isCoach={isCoach}
            onLinkClick={() => setIsOpen(false)}
          />
          
          {isAuthenticated ? (
            <>
              <div className="flex items-center px-2 py-1.5">
                <span className="text-sm font-medium mr-2">
                  {user?.username || 'User'}
                </span>
                {user?.role && (
                  <span className={getUserRoleStyles(user.role)}>
                    {user.role.replace('_', ' ')}
                  </span>
                )}
              </div>
              <Button onClick={handleLogout} variant="destructive" size="sm" className="flex items-center justify-start px-2 py-1.5">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => {
                navigate('/login');
                setIsOpen(false);
              }} 
              className="w-full" 
              variant="default"
            >
              Login
            </Button>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
