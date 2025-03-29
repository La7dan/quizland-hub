
import { useQuizzes } from './hooks/useQuizzes';
import { useQuizDeletion } from './hooks/useQuizDeletion';
import { QuizCard } from './QuizCard';
import { DeleteQuizDialog } from './DeleteQuizDialog';
import { EmptyQuizState } from './EmptyQuizState';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';
import { useAuth } from '@/contexts/AuthContext';

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
  const { isAdmin } = useAuth();
  
  const { 
    quizzes, 
    loading, 
    error, 
    levelCodes, 
    connectionError,
    handleRetry,
    fetchQuizzes 
  } = useQuizzes({
    sortBy,
    sortOrder,
    categoryFilter,
    isLoading: propIsLoading,
    error: propError,
    quizzesData
  });

  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    confirmDeleteQuiz,
    handleDeleteQuiz
  } = useQuizDeletion(fetchQuizzes);

  // Render appropriate UI based on state
  if (loading) {
    return <LoadingState />;
  }

  if (error && !connectionError) {
    return <ErrorState errorMessage={error} onRetry={handleRetry} />;
  }

  if (quizzes.length === 0) {
    return <EmptyQuizState connectionError={connectionError} onRetry={handleRetry} />;
  }

  return (
    <>
      <QuizGrid 
        quizzes={quizzes}
        levelCodes={levelCodes}
        onDeleteClick={isAdmin ? confirmDeleteQuiz : undefined}
        isAdmin={isAdmin}
      />

      <DeleteQuizDialog 
        isOpen={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        onConfirmDelete={handleDeleteQuiz} 
      />
    </>
  );
}

function QuizGrid({ 
  quizzes, 
  levelCodes, 
  onDeleteClick,
  isAdmin
}: { 
  quizzes: any[]; 
  levelCodes: {[key: number]: string}; 
  onDeleteClick?: (quizId: number) => void;
  isAdmin?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
        <QuizCard 
          key={quiz.id} 
          quiz={quiz} 
          levelCodes={levelCodes} 
          onDeleteClick={onDeleteClick} 
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}
