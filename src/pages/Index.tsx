
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, ServerOff, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Navigation from '@/components/Navigation';
import { QuizzesList } from '@/components/quiz';
import { Toggle } from '@/components/ui/toggle';
import { useQuery } from '@tanstack/react-query';
import { getQuizzes } from '@/services/quiz';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { checkConnection } from '@/services/apiService';

export default function Index() {
  const { isAuthenticated, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  // Check database connection first
  const { data: connectionData, error: connectionError, refetch: refetchConnection } = useQuery({
    queryKey: ['database-connection'],
    queryFn: checkConnection,
    staleTime: 1000 * 60, // 1 minute
    retry: 1,
    refetchOnWindowFocus: false,
  });
  
  // Fetch quizzes from database when app loads with improved error handling
  const { data: quizzesData, isLoading, error, refetch } = useQuery({
    queryKey: ['quizzes'],
    queryFn: getQuizzes,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: connectionData?.success === true,
    refetchOnWindowFocus: false,
    meta: {
      onError: (error) => {
        console.error('Failed to fetch quizzes:', error);
        
        // Check if error is an authentication error
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('Authentication required')) {
          toast.error('Authentication required', {
            description: 'You need to log in to access this content',
            duration: 5000,
          });
        } else {
          toast.error('Error loading quizzes', {
            description: 'Unable to connect to the database. Please try again later.',
            duration: 5000,
          });
        }
      }
    }
  });
  
  const handleRetryConnection = () => {
    toast('Reconnecting...', {
      description: 'Attempting to connect to the database',
    });
    refetchConnection().then(() => {
      if (connectionData?.success) {
        refetch();
      }
    });
  };
  
  const handleLogin = () => {
    navigate('/login');
  };
  
  const hasConnectionIssue = connectionError || !connectionData?.success;
  const hasAuthIssue = error && error instanceof Error && 
                       error.message.includes('Authentication required');
  
  return (
    <div>
      <Navigation />
      
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="my-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Available Quizzes</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Browse and take quizzes to test your knowledge
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {!isAuthenticated && (
                <Button 
                  variant="outline"
                  onClick={handleLogin}
                  className="flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              )}
              
              <Toggle
                aria-label="Toggle theme"
                pressed={theme === "dark"}
                onPressedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Toggle>
            </div>
          </div>
          
          {hasConnectionIssue && (
            <Alert variant="destructive" className="mb-8">
              <ServerOff className="h-5 w-5" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription className="mt-2">
                <p>Unable to connect to the database server. This may be due to:</p>
                <ul className="list-disc pl-5 mt-2 mb-3">
                  <li>The server is currently down or restarting</li>
                  <li>Network connectivity issues</li>
                  <li>Firewall restrictions</li>
                </ul>
                <Button 
                  variant="outline" 
                  onClick={handleRetryConnection}
                  className="mt-2"
                >
                  Retry Connection
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {hasAuthIssue && !hasConnectionIssue && (
            <Alert variant="warning" className="mb-8">
              <LogIn className="h-5 w-5" />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription className="mt-2">
                <p>You need to log in to view and access quizzes.</p>
                <Button 
                  variant="outline" 
                  onClick={handleLogin}
                  className="mt-2"
                >
                  Go to Login
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <QuizzesList 
            isLoading={isLoading} 
            error={error} 
            quizzesData={quizzesData} 
          />
        </div>
      </div>
    </div>
  );
}
