
import { useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Navigation from '@/components/Navigation';
import { QuizzesList } from '@/components/quiz';
import { Toggle } from '@/components/ui/toggle';
import { useEffect } from 'react';
import { cleanDummyData } from '@/services/dbService';
import { useQuery } from '@tanstack/react-query';
import { getQuizzes } from '@/services/quiz';
import { toast } from 'sonner';

export default function Index() {
  const { isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  // Fetch quizzes from database when app loads with improved error handling
  const { data: quizzesData, isLoading, error, refetch } = useQuery({
    queryKey: ['quizzes'],
    queryFn: getQuizzes,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    meta: {
      onError: (error) => {
        console.error('Failed to fetch quizzes:', error);
        toast('Error loading quizzes', {
          description: 'Unable to connect to the database. Please try again later.',
          duration: 5000,
        });
      }
    }
  });
  
  // Clean dummy data when the app starts
  useEffect(() => {
    const cleanData = async () => {
      try {
        await cleanDummyData();
        console.log('Cleaned dummy data on app startup');
      } catch (error) {
        console.error('Failed to clean dummy data:', error);
      }
    };
    
    cleanData();
  }, []);
  
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
            
            <Toggle
              aria-label="Toggle theme"
              pressed={theme === "dark"}
              onPressedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Toggle>
          </div>
          
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
