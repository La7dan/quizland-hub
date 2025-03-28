
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getQuizzes, getQuizLevels, deleteQuiz } from '@/services/quizService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Plus, Trash, RefreshCw, ListChecks } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import QuizFormDialog from './QuizFormDialog';
import QuestionManagement from './QuestionManagement';

interface QuizManagementProps {
  onRefresh?: () => void;
}

const QuizManagement = ({ onRefresh }: QuizManagementProps) => {
  const [isQuizFormOpen, setIsQuizFormOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [selectedQuizzes, setSelectedQuizzes] = useState<number[]>([]);
  const [currentView, setCurrentView] = useState<'quizzes' | 'questions'>('quizzes');
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch quizzes with React Query
  const { 
    data: quizzesData, 
    isLoading: quizzesLoading, 
    refetch: refetchQuizzes 
  } = useQuery({
    queryKey: ['quizzes'],
    queryFn: getQuizzes
  });

  // Fetch levels for dropdowns
  const { data: levelsData } = useQuery({
    queryKey: ['quizLevels'],
    queryFn: getQuizLevels
  });

  const quizzes = quizzesData?.quizzes || [];
  const levels = levelsData?.levels || [];

  // Delete quiz mutation
  const deleteQuizMutation = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });
      if (onRefresh) onRefresh();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Bulk delete quizzes mutation
  const bulkDeleteQuizzesMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      for (const id of ids) {
        await deleteQuiz(id);
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: "Success",
        description: `${selectedQuizzes.length} quizzes deleted successfully`,
      });
      setSelectedQuizzes([]);
      if (onRefresh) onRefresh();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete quizzes: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  const handleRefresh = () => {
    refetchQuizzes();
    if (onRefresh) onRefresh();
  };

  const handleCreateQuiz = () => {
    setSelectedQuiz(null);
    setIsQuizFormOpen(true);
  };

  const handleEditQuiz = (quiz: any) => {
    setSelectedQuiz(quiz);
    setIsQuizFormOpen(true);
  };

  const handleDeleteQuiz = (id: number) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      deleteQuizMutation.mutate(id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedQuizzes.length === 0) {
      toast({
        title: "Info",
        description: "No quizzes selected to delete",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedQuizzes.length} quizzes?`)) {
      bulkDeleteQuizzesMutation.mutate(selectedQuizzes);
    }
  };

  const toggleQuizSelection = (id: number) => {
    setSelectedQuizzes(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(quizId => quizId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const toggleSelectAll = () => {
    if (quizzes.length > 0) {
      if (selectedQuizzes.length === quizzes.length) {
        setSelectedQuizzes([]);
      } else {
        setSelectedQuizzes(quizzes.map(quiz => quiz.id));
      }
    }
  };

  const getLevelName = (levelId: number) => {
    const level = levels.find(l => l.id === levelId);
    return level ? `${level.code} - ${level.name}` : 'Unknown';
  };

  const handleManageQuestions = (quizId: number) => {
    setActiveQuizId(quizId);
    setCurrentView('questions');
  };

  if (currentView === 'questions' && activeQuizId !== null) {
    return (
      <QuestionManagement 
        quizId={activeQuizId} 
        onBack={() => {
          setCurrentView('quizzes');
          setActiveQuizId(null);
          refetchQuizzes();
        }}
        onRefresh={handleRefresh}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quiz Management</h2>
        <div className="flex gap-2">
          {selectedQuizzes.length > 0 && (
            <Button 
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkDeleteQuizzesMutation.isPending}
              className="gap-2"
            >
              <Trash className="h-4 w-4" />
              Delete Selected ({selectedQuizzes.length})
            </Button>
          )}
          <Button 
            onClick={handleCreateQuiz}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Quiz
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={quizzesLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${quizzesLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {quizzesLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-8 bg-muted rounded-md">
          <p className="text-muted-foreground">No quizzes found. Create your first quiz!</p>
        </div>
      ) : (
        <Table>
          <TableCaption>List of all quizzes</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={quizzes.length > 0 && selectedQuizzes.length === quizzes.length}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all quizzes"
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Passing %</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes.map((quiz) => (
              <TableRow key={quiz.id} className={selectedQuizzes.includes(quiz.id) ? "bg-muted/50" : ""}>
                <TableCell>
                  <Checkbox 
                    checked={selectedQuizzes.includes(quiz.id)}
                    onCheckedChange={() => toggleQuizSelection(quiz.id)}
                    aria-label={`Select ${quiz.title}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{quiz.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{quiz.level_id ? getLevelName(quiz.level_id) : 'None'}</Badge>
                </TableCell>
                <TableCell>{quiz.passing_percentage}%</TableCell>
                <TableCell>
                  {quiz.is_visible ? (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                      <Eye className="h-3 w-3 mr-1" />
                      Visible
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-500 border-red-500">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Hidden
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{quiz.question_count || 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageQuestions(quiz.id)}
                      className="gap-1"
                    >
                      <ListChecks className="h-3 w-3" />
                      Questions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditQuiz(quiz)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <QuizFormDialog
        open={isQuizFormOpen}
        onOpenChange={setIsQuizFormOpen}
        quiz={selectedQuiz}
        levels={levels}
        onQuizSaved={handleRefresh}
      />
    </div>
  );
};

export default QuizManagement;
