
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getQuizById, addQuestion, updateQuestion, deleteQuestion } from '@/services/quizService';
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
import { Eye, EyeOff, Plus, Trash, ArrowLeft, RefreshCw } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import QuestionFormDialog from './QuestionFormDialog';

interface QuestionManagementProps {
  quizId: number;
  onBack: () => void;
  onRefresh?: () => void;
}

const QuestionManagement = ({ quizId, onBack, onRefresh }: QuestionManagementProps) => {
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch quiz details with React Query
  const { 
    data: quizData, 
    isLoading: quizLoading, 
    refetch: refetchQuiz 
  } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => getQuizById(quizId)
  });

  const quiz = quizData?.quiz || null;
  const questions = quizData?.questions || [];

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
      if (onRefresh) onRefresh();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete question: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Bulk delete questions mutation
  const bulkDeleteQuestionsMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      for (const id of ids) {
        await deleteQuestion(id);
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
      toast({
        title: "Success",
        description: `${selectedQuestions.length} questions deleted successfully`,
      });
      setSelectedQuestions([]);
      if (onRefresh) onRefresh();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete questions: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  const handleRefresh = () => {
    refetchQuiz();
    if (onRefresh) onRefresh();
  };

  const handleCreateQuestion = () => {
    setSelectedQuestion(null);
    setIsQuestionFormOpen(true);
  };

  const handleEditQuestion = (question: any) => {
    setSelectedQuestion(question);
    setIsQuestionFormOpen(true);
  };

  const handleDeleteQuestion = (id: number) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      deleteQuestionMutation.mutate(id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedQuestions.length === 0) {
      toast({
        title: "Info",
        description: "No questions selected to delete",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedQuestions.length} questions?`)) {
      bulkDeleteQuestionsMutation.mutate(selectedQuestions);
    }
  };

  const toggleQuestionSelection = (id: number) => {
    setSelectedQuestions(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(questionId => questionId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const toggleSelectAll = () => {
    if (questions.length > 0) {
      if (selectedQuestions.length === questions.length) {
        setSelectedQuestions([]);
      } else {
        setSelectedQuestions(questions.map(question => question.id));
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Quizzes
          </Button>
          <h2 className="text-2xl font-bold ml-2">
            {quiz ? quiz.title : 'Loading...'} - Questions
          </h2>
        </div>
        <div className="flex gap-2">
          {selectedQuestions.length > 0 && (
            <Button 
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkDeleteQuestionsMutation.isPending}
              className="gap-2"
            >
              <Trash className="h-4 w-4" />
              Delete Selected ({selectedQuestions.length})
            </Button>
          )}
          <Button 
            onClick={handleCreateQuestion}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={quizLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${quizLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {quizLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-8 bg-muted rounded-md">
          <p className="text-muted-foreground">No questions found. Add your first question!</p>
        </div>
      ) : (
        <Table>
          <TableCaption>Questions for {quiz?.title}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={questions.length > 0 && selectedQuestions.length === questions.length}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all questions"
                />
              </TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Answers</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id} className={selectedQuestions.includes(question.id) ? "bg-muted/50" : ""}>
                <TableCell>
                  <Checkbox 
                    checked={selectedQuestions.includes(question.id)}
                    onCheckedChange={() => toggleQuestionSelection(question.id)}
                    aria-label={`Select question ${question.id}`}
                  />
                </TableCell>
                <TableCell className="font-medium max-w-md truncate">
                  {question.question_text}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {question.question_type === 'multiple_choice' ? 'Multiple Choice' : 
                     question.question_type === 'true_false' ? 'True/False' : 
                     question.question_type === 'short_answer' ? 'Short Answer' : 
                     question.question_type}
                  </Badge>
                </TableCell>
                <TableCell>{question.points}</TableCell>
                <TableCell>
                  {question.is_visible ? (
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
                <TableCell>
                  {question.answers?.length || 0}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditQuestion(question)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
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

      <QuestionFormDialog
        open={isQuestionFormOpen}
        onOpenChange={setIsQuestionFormOpen}
        question={selectedQuestion}
        quizId={quizId}
        onQuestionSaved={handleRefresh}
      />
    </div>
  );
};

export default QuestionManagement;
