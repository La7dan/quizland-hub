import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizzes } from '@/services/quizService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { executeSql } from '@/services/dbService';

interface QuizzesListProps {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  categoryFilter?: string;
  isLoading?: boolean;
  error?: any;
  quizzesData?: any;
}

export default function QuizzesList({ 
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const fetchQuizzes = async () => {
    // If quizzes are provided through props, use them instead of fetching
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
    if (response.success) {
      // Filter quizzes based on user role
      let filteredQuizzes = response.quizzes || [];
      
      // For non-admin users, only show visible quizzes
      if (!isAuthenticated || (user && user.role !== 'super_admin' && user.role !== 'admin')) {
        filteredQuizzes = filteredQuizzes.filter((quiz: any) => quiz.is_visible);
      }
      
      // Apply category filter if selected
      if (categoryFilter !== "all") {
        filteredQuizzes = filteredQuizzes.filter((quiz: any) => 
          String(quiz.level_id) === categoryFilter
        );
      }
      
      // Sort quizzes
      const sortedQuizzes = sortQuizzes(filteredQuizzes, sortBy, sortOrder);
      setQuizzes(sortedQuizzes);
    } else {
      setError(response.message || "Failed to load quizzes");
      toast({
        title: "Error",
        description: response.message || "Failed to load quizzes",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Update loading state if prop changes
    if (propIsLoading !== undefined) {
      setLoading(propIsLoading);
    }
    
    // Update error state if prop changes
    if (propError) {
      setError(propError.message || "An error occurred");
    }
    
    // Process quizzes data if provided
    if (quizzesData) {
      processQuizzes(quizzesData);
    } else {
      fetchQuizzes();
    }
  }, [toast, sortBy, sortOrder, categoryFilter, isAuthenticated, user, propIsLoading, propError, quizzesData]);

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

  const handleStartQuiz = (quizId: number) => {
    navigate(`/quiz/${quizId}`);
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

  const handlePreviewQuiz = (quizId: number) => {
    navigate(`/quiz/preview/${quizId}`);
  };

  const confirmDeleteQuiz = (quizId: number) => {
    setDeleteQuizId(quizId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteQuiz = async () => {
    if (!deleteQuizId) return;
    
    try {
      setLoading(true);
      
      // First delete related questions
      await executeSql(`
        DELETE FROM questions WHERE quiz_id = ${deleteQuizId}
      `);
      
      // Then delete the quiz
      await executeSql(`
        DELETE FROM quizzes WHERE id = ${deleteQuizId}
      `);
      
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });
      
      // Refresh the list
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Connection Error</AlertTitle>
        <AlertDescription>
          <p className="mb-4">{error}</p>
          <Button onClick={handleRetry} variant="outline">
            Retry Connection
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/20 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">No Quizzes Available</h2>
        <p className="text-muted-foreground">Check back later for new quizzes.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>{quiz.title}</CardTitle>
                {(isAuthenticated && user && (user.role === 'super_admin' || user.role === 'admin')) && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 h-8 w-8" 
                    onClick={() => confirmDeleteQuiz(quiz.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <CardDescription>
                <Badge variant="outline" className="mt-1">
                  Level: {quiz.level_id}
                </Badge>
                {!quiz.is_visible && (
                  <Badge variant="outline" className="mt-1 ml-2 text-red-500 border-red-500">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Hidden
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {quiz.description || "Take this quiz to test your knowledge."}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{quiz.question_count || 0} Questions</span>
                <span>•</span>
                <span>Passing Score: {quiz.passing_percentage}%</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2 flex gap-2">
              <Button 
                onClick={() => handleStartQuiz(quiz.id)}
                className="w-full"
              >
                Start Quiz
              </Button>
              
              {(isAuthenticated && user && (user.role === 'super_admin' || user.role === 'admin')) && (
                <Button 
                  variant="outline"
                  onClick={() => handlePreviewQuiz(quiz.id)}
                  className="flex-shrink-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the quiz and all associated questions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuiz} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
