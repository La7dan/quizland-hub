
import { useState, useEffect } from 'react';
import { getQuizzes, getQuizLevels } from '@/services/quiz';
import { useToast } from '@/hooks/use-toast';
import { executeSql, deleteQuiz } from '@/services/dbService';
import { QuizCard } from './QuizCard';
import { DeleteQuizDialog } from './DeleteQuizDialog';
import { EmptyQuizState } from './EmptyQuizState';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';

interface QuizzesListProps {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  categoryFilter?: string;
  isLoading?: boolean;
  error?: any;
  quizzesData?: any;
}

export function QuizzesList({ 
  sortBy = "default", 
  sortOrder = "asc", 
  categoryFilter = "all",
  isLoading: propIsLoading,
  error: propError,
  quizzesData
}: QuizzesListProps) {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(propIsLoading !== undefined ? propIsLoading : true);
  const [error, setError] = useState<string | null>(propError ? propError.message || "An error occurred" : null);
  const [deleteQuizId, setDeleteQuizId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [levelCodes, setLevelCodes] = useState<{[key: number]: string}>({});
  const { toast } = useToast();

  const fetchLevelCodes = async () => {
    try {
      const response = await getQuizLevels();
      if (response && response.success) {
        const levelsMap: {[key: number]: string} = {};
        response.levels.forEach((level: any) => {
          levelsMap[level.id] = level.code;
        });
        setLevelCodes(levelsMap);
      }
    } catch (error) {
      console.error('Error loading quiz levels:', error);
    }
  };

  const fetchQuizzes = async () => {
    if (quizzesData && !propIsLoading) {
      processQuizzes(quizzesData);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const response = await getQuizzes();
      processQuizzes(response);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      setError("Unable to connect to the quiz server. Please try again later.");
      toast({
        title: "Connection Error",
        description: "Unable to connect to the quiz server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processQuizzes = (response: any) => {
    if (response && response.success) {
      let filteredQuizzes = response.quizzes || [];
      
      // Apply filtering based on user role and visibility
      filteredQuizzes = applyFilters(filteredQuizzes);
      
      const sortedQuizzes = sortQuizzes(filteredQuizzes, sortBy, sortOrder);
      setQuizzes(sortedQuizzes);
    } else {
      setError(response?.message || "Failed to load quizzes");
      toast({
        title: "Error",
        description: response?.message || "Failed to load quizzes",
        variant: "destructive",
      });
    }
  };

  // Extract filter logic to a separate function
  const applyFilters = (quizzesArray: any[]) => {
    let filtered = [...quizzesArray];
    
    // Filter based on user authentication and visibility
    if (!isUserAdmin()) {
      filtered = filtered.filter((quiz: any) => quiz.is_visible);
    }
    
    // Filter by category if specified
    if (categoryFilter !== "all") {
      filtered = filtered.filter((quiz: any) => 
        String(quiz.level_id) === categoryFilter
      );
    }
    
    return filtered;
  };

  // Check if current user is admin
  const isUserAdmin = () => {
    const { user, isAuthenticated } = require('@/contexts/AuthContext').useAuth();
    return isAuthenticated && user && (user.role === 'super_admin' || user.role === 'admin');
  };

  useEffect(() => {
    // Fetch level codes first
    fetchLevelCodes();
    
    if (propIsLoading !== undefined) {
      setLoading(propIsLoading);
    }
    
    if (propError) {
      setError(propError.message || "An error occurred");
    }
    
    if (quizzesData) {
      processQuizzes(quizzesData);
    } else {
      fetchQuizzes();
    }
  }, [sortBy, sortOrder, categoryFilter, propIsLoading, propError, quizzesData]);

  const sortQuizzes = (quizzesArray: any[], sortByField: string, order: "asc" | "desc") => {
    if (sortByField === "default") return quizzesArray;
    
    return [...quizzesArray].sort((a, b) => {
      let comparison = 0;
      
      if (sortByField === "level") {
        comparison = a.level_id - b.level_id;
      } else if (sortByField === "pass") {
        comparison = a.passing_percentage - b.passing_percentage;
      }
      
      return order === "asc" ? comparison : -comparison;
    });
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchQuizzes();
    toast({
      title: "Retrying",
      description: "Attempting to reconnect to the quiz server...",
    });
  };

  const confirmDeleteQuiz = (quizId: number) => {
    setDeleteQuizId(quizId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteQuiz = async () => {
    if (!deleteQuizId) return;
    
    try {
      setLoading(true);
      
      await executeSql(`
        DELETE FROM questions WHERE quiz_id = ${deleteQuizId}
      `);
      
      await deleteQuiz(deleteQuizId);
      
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });
      
      fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteQuizId(null);
      setLoading(false);
    }
  };

  // Render appropriate UI based on state
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState errorMessage={error} onRetry={handleRetry} />;
  }

  if (quizzes.length === 0) {
    return <EmptyQuizState />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <QuizCard 
            key={quiz.id} 
            quiz={quiz} 
            levelCodes={levelCodes} 
            onDeleteClick={confirmDeleteQuiz} 
          />
        ))}
      </div>

      <DeleteQuizDialog 
        isOpen={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        onConfirmDelete={handleDeleteQuiz} 
      />
    </>
  );
}
