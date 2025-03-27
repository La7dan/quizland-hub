
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getQuizAttempts } from '@/services/quizService';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface QuizAttemptsProps {
  onRefresh?: () => void;
}

const QuizAttempts = ({ onRefresh }: QuizAttemptsProps) => {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getQuizAttempts();
      
      if (response.success) {
        setAttempts(response.attempts || []);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load quiz attempts",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading quiz attempts:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz attempts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quiz Attempts</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : attempts.length === 0 ? (
        <div className="text-center py-8 bg-muted rounded-md">
          <p className="text-muted-foreground">No quiz attempts found.</p>
        </div>
      ) : (
        <Table>
          <TableCaption>List of all quiz attempts</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Quiz</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Member ID</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attempts.map((attempt) => (
              <TableRow key={attempt.id}>
                <TableCell>
                  {format(new Date(attempt.attempt_date), 'MMM d, yyyy h:mm a')}
                </TableCell>
                <TableCell>{attempt.quiz_title}</TableCell>
                <TableCell>{attempt.visitor_name}</TableCell>
                <TableCell>{attempt.member_id}</TableCell>
                <TableCell>{attempt.score}</TableCell>
                <TableCell>{attempt.percentage}%</TableCell>
                <TableCell>
                  {attempt.result === 'passed' ? (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      Passed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-500">
                      Not Ready
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default QuizAttempts;
