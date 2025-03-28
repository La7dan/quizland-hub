
import { useNavigate } from 'react-router-dom';
import { BookOpen, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Navigation from '@/components/Navigation';
import QuizzesList from '@/components/QuizzesList';
import { Toggle } from '@/components/ui/toggle';
import { useEffect } from 'react';
import { cleanDummyData } from '@/services/dbService';
import { useQuery } from '@tanstack/react-query';
import { getQuizzes } from '@/services/quizService';

export default function Index() {
  const { isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  // Fetch quizzes from database when app loads
  const { data: quizzesData, isLoading, error } = useQuery({
    queryKey: ['quizzes'],
    queryFn: getQuizzes,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
          
          <QuizzesList isLoading={isLoading} error={error} quizzesData={quizzesData} />
        </div>
      </div>
    </div>
  );
}
