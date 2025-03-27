
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getQuizzes, getQuizLevels } from '@/services/quizService';
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
import { Eye, EyeOff, Plus } from 'lucide-react';
import QuizFormDialog from './QuizFormDialog';

interface QuizManagementProps {
  onRefresh?: () => void;
}

const QuizManagement = ({ onRefresh }: QuizManagementProps) => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isQuizFormOpen, setIsQuizFormOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const quizzesResponse = await getQuizzes();
      const levelsResponse = await getQuizLevels();
      
      if (quizzesResponse.success) {
        setQuizzes(quizzesResponse.quizzes || []);
      } else {
        toast({
          title: "Error",
          description: quizzesResponse.message || "Failed to load quizzes",
          variant: "destructive",
        });
      }
      
      if (levelsResponse.success) {
        setLevels(levelsResponse.levels || []);
      }
    } catch (error) {
      console.error('Error loading quiz data:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
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

  const getLevelName = (levelId: number) => {
    const level = levels.find(l => l.id === levelId);
    return level ? `${level.code} - ${level.name}` : 'Unknown';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quiz Management</h2>
        <Button 
          onClick={handleCreateQuiz}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Quiz
        </Button>
      </div>

      {loading ? (
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
              <TableRow key={quiz.id}>
                <TableCell className="font-medium">{quiz.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{getLevelName(quiz.level_id)}</Badge>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditQuiz(quiz)}
                  >
                    Edit
                  </Button>
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
