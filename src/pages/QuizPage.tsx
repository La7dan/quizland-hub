import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { getQuizById, saveQuizAttempt } from '@/services/quiz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const QuizPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [name, setName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [nameError, setNameError] = useState('');
  const [memberIdError, setMemberIdError] = useState('');

  useEffect(() => {
    if (id) {
      loadQuiz(parseInt(id));
    }
  }, [id]);

  const loadQuiz = async (quizId: number) => {
    setLoading(true);
    setConnectionError(false);
    setError(null);
    try {
      const response = await getQuizById(quizId);
      
      if (response.success && response.quiz) {
        // Only show visible questions for visitors
        const visibleQuestions = (response.questions || [])
          .filter(q => q.is_visible);
        
        setQuiz(response.quiz);
        setQuestions(visibleQuestions);
      } else {
        setError(response.message || "Quiz not found");
        toast({
          title: "Error",
          description: response.message || "Quiz not found or has been removed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      setConnectionError(true);
      toast({
        title: "Connection Error",
        description: "Unable to connect to the quiz server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (id) {
      loadQuiz(parseInt(id));
      toast({
        title: "Retrying",
        description: "Attempting to reconnect to the quiz server...",
      });
    }
  };

  const startQuiz = () => {
    let valid = true;
    
    if (!name.trim()) {
      setNameError('Please enter your name');
      valid = false;
    } else {
      setNameError('');
    }
    
    if (!memberId.trim()) {
      setMemberIdError('Please enter your Member ID');
      valid = false;
    } else if (!memberId.startsWith('SH')) {
      setMemberIdError('Member ID must start with SH');
      valid = false;
    } else {
      setMemberIdError('');
    }
    
    if (valid) {
      setQuizStarted(true);
    }
  };

  const handleAnswerSelect = (questionId: number, answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    let totalPoints = 0;
    
    questions.forEach(question => {
      totalPoints += question.points;
      
      const selectedAnswerId = answers[question.id];
      if (selectedAnswerId) {
        const correctAnswer = question.answers.find(
          (a: any) => a.is_correct && a.id === parseInt(selectedAnswerId)
        );
        
        if (correctAnswer) {
          score += question.points;
        }
      }
    });
    
    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const passed = percentage >= quiz.passing_percentage;
    
    return {
      score,
      totalPoints,
      percentage: Number(percentage.toFixed(2)),
      passed,
      result: passed ? 'passed' : 'not_ready'
    };
  };

  const submitQuiz = async () => {
    const scoreResult = calculateScore();
    setResult(scoreResult);
    setQuizCompleted(true);
    
    try {
      await saveQuizAttempt({
        quiz_id: quiz.id,
        member_id: memberId,
        visitor_name: name,
        score: scoreResult.score,
        percentage: scoreResult.percentage,
        result: scoreResult.passed ? 'passed' : 'not_ready',
        total_questions: questions.length,
        passed: scoreResult.passed,
        time_taken: 0 // You could add timing functionality if needed
      });
    } catch (error) {
      console.error('Error recording quiz attempt:', error);
      // Continue even if recording fails
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl flex justify-center py-24">
        <div className="h-8 w-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="container mx-auto p-4 max-w-4xl text-center py-24">
        <h1 className="text-2xl font-bold mb-4">Connection Error</h1>
        <p className="mb-8">Unable to connect to the quiz server. This might be due to network issues or server maintenance.</p>
        <Button onClick={handleRetry} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!quiz || !quiz.is_visible) {
    return (
      <div className="container mx-auto p-4 max-w-4xl text-center py-24">
        <h1 className="text-2xl font-bold mb-4">Quiz Not Found</h1>
        <p className="mb-8">The quiz you're looking for is either not available or has been removed.</p>
        <Button onClick={() => navigate('/quizzes')}>Return to Quizzes</Button>
      </div>
    );
  }

  if (quizCompleted && result) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Quiz Results</h1>
          
          <div className="flex justify-center mb-8">
            {result.passed ? (
              <div className="flex flex-col items-center text-green-600">
                <CheckCircle className="h-24 w-24 mb-4" />
                <h2 className="text-xl font-bold">Congratulations!</h2>
                <p className="text-lg">You've passed the quiz.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-yellow-600">
                <XCircle className="h-24 w-24 mb-4" />
                <h2 className="text-xl font-bold">Not Ready Yet</h2>
                <p className="text-lg">Keep practicing and try again.</p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-lg font-bold">{result.score} / {result.totalPoints}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="text-sm text-gray-600">Percentage</p>
              <p className="text-lg font-bold">{result.percentage}%</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="text-sm text-gray-600">Required to Pass</p>
              <p className="text-lg font-bold">{quiz.passing_percentage}%</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="text-sm text-gray-600">Result</p>
              <p className="text-lg font-bold">{result.passed ? 'Passed' : 'Not Ready'}</p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button onClick={() => navigate('/')}>Return Home</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
          <p className="text-gray-600 mb-6">{quiz.description}</p>
          
          <Separator className="my-6" />
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-4">Quiz Information</h2>
              <ul className="space-y-2 text-sm">
                <li><strong>Number of Questions:</strong> {questions.length}</li>
                <li><strong>Passing Score Required:</strong> {quiz.passing_percentage}%</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Your Information</h2>
              
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className={nameError ? "border-red-500" : ""}
                  placeholder="Enter your full name"
                />
                {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
              </div>
              
              <div>
                <Label htmlFor="memberId">Member ID</Label>
                <Input 
                  id="memberId" 
                  value={memberId} 
                  onChange={(e) => setMemberId(e.target.value)}
                  className={memberIdError ? "border-red-500" : ""}
                  placeholder="Enter your Member ID (starts with SH)"
                />
                {memberIdError && <p className="text-red-500 text-sm mt-1">{memberIdError}</p>}
              </div>
            </div>
            
            <div className="pt-4">
              <Button onClick={startQuiz} className="w-full">
                Start Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isQuestionAnswered = answers[currentQuestionData.id] !== undefined;
  const allQuestionsAnswered = questions.every(q => answers[q.id] !== undefined);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">{quiz.title}</h1>
          <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>
        
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">
            {currentQuestionData.question_text}
          </h2>
          
          <RadioGroup
            value={answers[currentQuestionData.id]}
            onValueChange={(value) => handleAnswerSelect(currentQuestionData.id, value)}
            className="space-y-3"
          >
            {currentQuestionData.answers.map((answer: any) => (
              <div key={answer.id} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
                <RadioGroupItem 
                  value={answer.id.toString()} 
                  id={`answer-${answer.id}`} 
                />
                <Label 
                  htmlFor={`answer-${answer.id}`}
                  className="flex-grow cursor-pointer py-1"
                >
                  {answer.answer_text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={goToPrevQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          {isLastQuestion ? (
            <Button 
              onClick={submitQuiz} 
              disabled={!allQuestionsAnswered}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button 
              onClick={goToNextQuestion}
              disabled={!isQuestionAnswered}
            >
              Next
            </Button>
          )}
        </div>
        
        {isLastQuestion && !allQuestionsAnswered && (
          <p className="text-amber-600 text-sm mt-2 text-center">
            Please answer all questions before submitting.
          </p>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
