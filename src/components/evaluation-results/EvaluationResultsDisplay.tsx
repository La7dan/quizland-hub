
import React from 'react';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface EvaluationResult {
  id: number;
  member_name: string;
  member_code: string;
  status: string;
  evaluation_result: string;
  nominated_at: string;
  evaluation_date: string;
  coach_name: string;
}

interface EvaluationResultsDisplayProps {
  evaluationResult: EvaluationResult;
  onReset: () => void;
}

const EvaluationResultsDisplay: React.FC<EvaluationResultsDisplayProps> = ({
  evaluationResult,
  onReset
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Evaluation Results</CardTitle>
        <CardDescription>
          Here is the status of your most recent evaluation
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-muted">
          <h3 className="font-semibold text-lg mb-4">Member Information</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm text-muted-foreground">Name:</div>
            <div className="text-sm font-medium">{evaluationResult.member_name}</div>
            
            <div className="text-sm text-muted-foreground">Member ID:</div>
            <div className="text-sm font-medium">{evaluationResult.member_code}</div>
            
            <div className="text-sm text-muted-foreground">Coach:</div>
            <div className="text-sm font-medium">{evaluationResult.coach_name}</div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border">
          <h3 className="font-semibold text-lg mb-4">Evaluation Status</h3>
          
          <div className="flex items-center mb-4">
            <div className="mr-2">
              {evaluationResult.evaluation_result === 'passed' ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <AlertCircle className="h-6 w-6 text-amber-500" />
              )}
            </div>
            <div>
              <div className="font-medium">
                {evaluationResult.evaluation_result === 'passed' 
                  ? 'Passed' 
                  : evaluationResult.evaluation_result === 'not_ready' 
                    ? 'Not Ready' 
                    : evaluationResult.status}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm text-muted-foreground">Nominated Date:</div>
            <div className="text-sm font-medium">
              {evaluationResult.nominated_at 
                ? format(new Date(evaluationResult.nominated_at), 'PPP') 
                : 'N/A'}
            </div>
            
            <div className="text-sm text-muted-foreground">Evaluation Date:</div>
            <div className="text-sm font-medium">
              {evaluationResult.evaluation_date 
                ? format(new Date(evaluationResult.evaluation_date), 'PPP') 
                : 'N/A'}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" onClick={onReset} className="w-full">
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EvaluationResultsDisplay;
