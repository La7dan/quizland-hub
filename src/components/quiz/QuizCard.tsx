
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QuizCardProps {
  quiz: any;
  levelCodes: {[key: number]: string};
  onDeleteClick: (quizId: number) => void;
}

export function QuizCard({ quiz, levelCodes, onDeleteClick }: QuizCardProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const handleStartQuiz = (quizId: number) => {
    navigate(`/quiz/${quizId}`);
  };

  const handlePreviewQuiz = (quizId: number) => {
    navigate(`/quiz/preview/${quizId}`);
  };

  // Check if user has admin privileges (super_admin or admin)
  const isAdmin = isAuthenticated && user && (user.role === 'super_admin' || user.role === 'admin');

  return (
    <Card key={quiz.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>{quiz.title}</CardTitle>
          {isAdmin && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-red-500 h-8 w-8" 
              onClick={() => onDeleteClick(quiz.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          <Badge variant="outline" className="mt-1">
            Level: {levelCodes[quiz.level_id] || quiz.level_id}
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
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex gap-2">
        <Button 
          onClick={() => handleStartQuiz(quiz.id)}
          className="w-full"
          disabled={!quiz.question_count || quiz.question_count === 0}
        >
          {!quiz.question_count || quiz.question_count === 0 ? "No Questions" : "Start Quiz"}
        </Button>
        
        {isAdmin && (
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
  );
}
