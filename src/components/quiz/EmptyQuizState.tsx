
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface EmptyQuizStateProps {
  connectionError?: boolean;
  onRetry?: () => void;
}

export function EmptyQuizState({ connectionError, onRetry }: EmptyQuizStateProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user && (user.role === 'super_admin' || user.role === 'admin');
  
  if (connectionError) {
    return (
      <div className="text-center py-12 bg-muted/20 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
        <p className="text-muted-foreground mb-6">
          Unable to connect to the quiz server. This might be due to network issues or server maintenance.
        </p>
        
        <Button onClick={onRetry} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="text-center py-12 bg-muted/20 rounded-lg">
      <h2 className="text-xl font-semibold mb-2">No Quizzes Available</h2>
      <p className="text-muted-foreground mb-6">
        {isAdmin
          ? "There are no quizzes yet. Start by creating your first quiz." 
          : "There are no quizzes available yet. Please check back later."}
      </p>
      
      {isAdmin && (
        <Button onClick={() => navigate('/admin')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Quiz
        </Button>
      )}
    </div>
  );
}
