
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const { toast } = useToast();
  const { user, logout, isAuthenticated, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="border-b bg-background">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <span className="font-bold text-xl">Quiz Platform</span>
        </Link>
        
        <nav className="ml-auto flex items-center gap-4">
          <Link 
            to="/" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link 
            to="/quizzes" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Quizzes
          </Link>
          
          {isAuthenticated ? (
            <>
              {isSuperAdmin && (
                <Link 
                  to="/admin" 
                  className="text-sm font-medium transition-colors hover:text-primary ml-4 flex items-center"
                >
                  <Shield className="mr-1 h-4 w-4" />
                  Admin Panel
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
                        ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : 
                        user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'}`}
                      >
                        {user.role.replace('_', ' ')}
                      </span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={() => navigate('/login')} className="ml-4" variant="default">
              Login
            </Button>
          )}
        </nav>
      </div>
    </div>
  );
}
