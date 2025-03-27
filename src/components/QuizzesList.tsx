
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizzes } from '@/services/quizService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function QuizzesList() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await getQuizzes();
        if (response.success) {
          // Only show visible quizzes to regular users
          const visibleQuizzes = response.quizzes.filter((quiz: any) => quiz.is_visible);
          setQuizzes(visibleQuizzes);
        } else {
          toast({
            title: "Error",
            description: "Failed to load quizzes",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error loading quizzes:', error);
        toast({
          title: "Error",
          description: "Failed to load quizzes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [toast]);

  const handleStartQuiz = (quizId: number) => {
    navigate(`/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      </div>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
        <Card key={quiz.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>{quiz.title}</CardTitle>
            <CardDescription>
              <Badge variant="outline" className="mt-1">
                Level: {quiz.level_id}
              </Badge>
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
          <CardFooter className="pt-2">
            <Button 
              onClick={() => handleStartQuiz(quiz.id)}
              className="w-full"
            >
              Start Quiz
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
