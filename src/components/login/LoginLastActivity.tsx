
import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginLastActivityProps {
  lastLogin: { time: string, location: string } | null;
}

const LoginLastActivity: React.FC<LoginLastActivityProps> = ({ lastLogin }) => {
  const { user, isSuperAdmin } = useAuth();
  
  // Only show last login activity to super admins
  if (!lastLogin || !isSuperAdmin) return null;
  
  return (
    <div className="text-sm text-muted-foreground mb-4 border border-border rounded-md p-3 bg-secondary/20">
      <div className="flex items-center mb-1 text-xs sm:text-sm font-medium">
        <Clock className="h-3.5 w-3.5 mr-1.5" />
        Last login time:
      </div>
      <p className="pl-5 text-xs sm:text-sm">{lastLogin.time}</p>
      <div className="flex items-center mt-2 mb-1 text-xs sm:text-sm font-medium">
        <MapPin className="h-3.5 w-3.5 mr-1.5" />
        Location:
      </div>
      <p className="pl-5 text-xs sm:text-sm">{lastLogin.location}</p>
    </div>
  );
};

export default LoginLastActivity;
