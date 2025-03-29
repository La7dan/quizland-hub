
import { User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { getUserRoleStyles } from './navigationUtils';

interface UserDropdownMenuProps {
  user: { username: string; role: string; } | null;
  onLogout: () => void;
}

export function UserDropdownMenu({ user, onLogout }: UserDropdownMenuProps) {
  if (!user) return null;
  
  return (
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
            <span className={getUserRoleStyles(user.role)}>
              {user.role.replace('_', ' ')}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-red-600 flex items-center">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
