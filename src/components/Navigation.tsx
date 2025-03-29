
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Shield, Menu, X } from 'lucide-react';
import JumpingHorse from './icons/JumpingHorse';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function Navigation() {
  const { toast } = useToast();
  const { user, logout, isAuthenticated, isSuperAdmin, isAdmin } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
      duration: 3000,
    });
    navigate('/');
    setIsOpen(false);
  };

  const isCoach = user?.role === 'coach';
  
  // Only show login button for non-authenticated users
  const shouldShowLoginButton = !isAuthenticated;
  
  // Log the state to troubleshoot
  console.log("Navigation rendering with:", { isAuthenticated, shouldShowLoginButton, user, isAdmin, isCoach });

  return (
    <div className="border-b bg-background shadow-sm">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <JumpingHorse className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Alshaqab Quiz System</span>
        </Link>
        
        {isMobile ? (
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
                <Link 
                  to="/" 
                  className="text-sm font-medium transition-colors hover:text-primary px-2 py-1.5"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                
                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        className="text-sm font-medium transition-colors hover:text-primary px-2 py-1.5 flex items-center"
                        onClick={() => setIsOpen(false)}
                      >
                        <Shield className="mr-1 h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}
                    {isCoach && (
                      <Link 
                        to="/coach" 
                        className="text-sm font-medium transition-colors hover:text-primary px-2 py-1.5 flex items-center"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="mr-1 h-4 w-4" />
                        Coach Dashboard
                      </Link>
                    )}
                    <div className="flex items-center px-2 py-1.5">
                      <span className="text-sm font-medium mr-2">
                        {user?.username || 'User'}
                      </span>
                      {user?.role && (
                        <span className={`px-2 text-xs leading-5 font-semibold rounded-full 
                          ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 
                          user.role === 'admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}
                        >
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
                  shouldShowLoginButton && (
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
                  )
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <nav className="ml-auto flex items-center gap-4">
            <Link 
              to="/" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-sm font-medium transition-colors hover:text-primary ml-4 flex items-center"
                  >
                    <Shield className="mr-1 h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                {isCoach && (
                  <Link 
                    to="/coach" 
                    className="text-sm font-medium transition-colors hover:text-primary ml-4 flex items-center"
                  >
                    <User className="mr-1 h-4 w-4" />
                    Coach Dashboard
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="h-5 w-5" />
                      <span className="sr-only">User menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background border z-50">
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <span>
                        {user?.username || 'User'}
                      </span>
                      {user?.role && (
                        <span className={`px-2 text-xs leading-5 font-semibold rounded-full 
                          ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 
                          user.role === 'admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}
                        >
                          {user.role.replace('_', ' ')}
                        </span>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : null}
          </nav>
        )}
      </div>
    </div>
  );
}
