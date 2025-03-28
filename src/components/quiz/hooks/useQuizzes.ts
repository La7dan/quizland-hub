
import { useState, useEffect } from 'react';
import { getQuizzes, getQuizLevels } from '@/services/quiz';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function useQuizzes({ 
  sortBy = "default", 
  sortOrder = "asc", 
  categoryFilter = "all",
  isLoading: propIsLoading,
  error: propError,
  quizzesData
}: {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  categoryFilter?: string;
  isLoading?: boolean;
  error?: any;
  quizzesData?: any;
}) {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(propIsLoading !== undefined ? propIsLoading : true);
  const [error, setError] = useState<string | null>(propError ? propError.message || "An error occurred" : null);
  const [levelCodes, setLevelCodes] = useState<{[key: number]: string}>({});
  const [connectionError, setConnectionError] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

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
      setConnectionError(true);
    }
  };

  const fetchQuizzes = async () => {
    if (quizzesData && !propIsLoading) {
      processQuizzes(quizzesData);
      return;
    }

    try {
      setError(null);
      setConnectionError(false);
      setLoading(true);
      const response = await getQuizzes();
      processQuizzes(response);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      setConnectionError(true);
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
    return isAuthenticated && user && (user.role === 'super_admin' || user.role === 'admin');
  };

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
    setConnectionError(false);
    fetchQuizzes();
    toast({
      title: "Retrying",
      description: "Attempting to reconnect to the quiz server...",
    });
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

  return {
    quizzes,
    loading,
    error,
    levelCodes,
    connectionError,
    handleRetry,
    fetchQuizzes
  };
}
