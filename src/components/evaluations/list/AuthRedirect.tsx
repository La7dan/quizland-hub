
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AuthRedirectProps {
  isAdmin: boolean;
  children: React.ReactNode;
}

const AuthRedirect: React.FC<AuthRedirectProps> = ({ isAdmin, children }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view evaluations.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [isAdmin, navigate, toast]);
  
  return <>{children}</>;
};

export default AuthRedirect;
