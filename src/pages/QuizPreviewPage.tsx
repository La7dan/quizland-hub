import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext';
import { getQuizById } from '@/services/quiz';

export default function QuizPreviewPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) {
        setError("Quiz ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const id = parseInt(quizId, 10);
        const response = await getQuizById(id);

        if (response.success) {
          setQuiz(response.quiz);
          setQuestions(response.questions);
        } else {
          setError(response.message || "Failed to load quiz");
        }
      } catch (err) {
        setError("Failed to connect to the quiz server.");
        console.error("Error loading quiz:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleGoBack = () => {
    navigate('/admin/quizzes');
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
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          <p className="mb-4">{error}</p>
          <Button onClick={handleGoBack} variant="outline">
            Go Back
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12 bg-muted/20 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Quiz Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The requested quiz does not exist.
        </p>
        <Button onClick={handleGoBack} className="flex items-center gap-2">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="my-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Quiz Preview</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Preview of: {quiz.title}
            </p>
          </div>
          <Button onClick={handleGoBack} variant="outline">
            Go Back
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>{quiz.title}</CardTitle>
            <CardDescription>
              <Badge variant="outline" className="mt-1">
                Level: {quiz.level_id}
              </Badge>
              {!quiz.is_visible && (
                <Badge variant="outline" className="mt-1 ml-2 text-red-500 border-red-500">
                  Hidden
                </Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {quiz.description || "No description provided."}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{questions.length} Questions</span>
              <span>•</span>
              <span>Passing Score: {quiz.passing_percentage}%</span>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold mb-4">Questions</h2>
        {questions.length === 0 ? (
          <div className="text-center py-6 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">No questions available for this quiz.</p>
          </div>
        ) : (
          questions.map((question: any, index: number) => (
            <Card key={question.id} className="mb-4">
              <CardHeader>
                <CardTitle>Question {index + 1}</CardTitle>
                <CardDescription>
                  {question.question_text}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Type: {question.question_type}
                </p>
                {question.answers && question.answers.length > 0 && (
                  <ul className="mt-2">
                    {question.answers.map((answer: any) => (
                      <li key={answer.id} className="flex items-center gap-2">
                        {answer.is_correct && <Badge variant="outline">Correct</Badge>}
                        <span>{answer.answer_text}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
