
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizById } from '@/services/quizService';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function QuizPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await getQuizById(Number(id));
        
        if (response.success) {
          setQuiz(response.quiz);
          setQuestions(response.questions || []);
        } else {
          setError(response.message || "Failed to load quiz");
          toast({
            title: "Error",
            description: response.message || "Failed to load quiz",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error loading quiz:', error);
        setError("Failed to load quiz details");
        toast({
          title: "Error",
          description: "Failed to load quiz details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, toast]);

  useEffect(() => {
    // Redirect if not admin or super_admin
    if (!loading && isAuthenticated && user && 
        user.role !== 'admin' && user.role !== 'super_admin') {
      navigate('/quizzes');
      toast({
        title: "Access Denied",
        description: "You don't have permission to preview quizzes",
        variant: "destructive",
      });
    }
  }, [loading, isAuthenticated, user, navigate, toast]);

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div>
        <Navigation />
        <div className="container mx-auto p-4 max-w-4xl">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || "Quiz not found"}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/quizzes')} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Button onClick={() => navigate('/quizzes')} variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Quiz Preview</h1>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{quiz.title}</CardTitle>
              <Badge variant={quiz.is_visible ? "outline" : "destructive"}>
                {quiz.is_visible ? "Visible" : "Hidden"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="font-semibold mb-1">Description</h3>
              <p className="text-muted-foreground">
                {quiz.description || "No description provided."}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold mb-1">Level</h3>
                <Badge variant="secondary">{quiz.level_id}</Badge>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Passing Score</h3>
                <Badge variant="secondary">{quiz.passing_percentage}%</Badge>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Questions ({questions.length})</h3>
              
              {questions.length === 0 ? (
                <div className="text-center py-8 bg-muted/20 rounded-lg">
                  <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No questions have been added to this quiz yet.</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {questions.map((question, index) => (
                    <AccordionItem key={question.id} value={`question-${question.id}`}>
                      <AccordionTrigger className="text-left">
                        <span className="font-medium">Q{index + 1}: {question.question_text}</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-4 border-l-2 border-muted mt-2">
                          <p className="font-medium mb-2">Answers:</p>
                          <ul className="space-y-2">
                            {question.answers && question.answers.map((answer: any) => (
                              <li key={answer.id} className="flex items-start gap-2">
                                <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-xs ${answer.is_correct ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-muted text-muted-foreground'}`}>
                                  {answer.is_correct ? '✓' : ''}
                                </span>
                                <span className={answer.is_correct ? 'font-medium' : ''}>
                                  {answer.answer_text}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button onClick={() => navigate('/quizzes')} variant="outline">
            Back to Quizzes
          </Button>
          <Button onClick={() => navigate(`/quiz/${id}`)}>
            Take Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}
