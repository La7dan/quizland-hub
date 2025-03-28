
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AuthError = () => {
  const navigate = useNavigate();
  
  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
        <p className="text-gray-500 mb-4">
          You need to be logged in to view and manage database tables.
        </p>
        <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90">
          Log in to continue
        </Button>
      </div>
    </div>
  );
};

export default AuthError;
