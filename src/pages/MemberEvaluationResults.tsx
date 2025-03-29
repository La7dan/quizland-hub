
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { executeSql } from '@/services/apiService';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Coach {
  id: number;
  name: string;
}

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

const MemberEvaluationResults: React.FC = () => {
  const { toast } = useToast();
  const [memberName, setMemberName] = useState('');
  const [memberCode, setMemberCode] = useState('');
  const [coachId, setCoachId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  // Fetch coaches for the dropdown
  const { data: coaches, isLoading: isLoadingCoaches } = useQuery({
    queryKey: ['coaches'],
    queryFn: async () => {
      const result = await executeSql(`
        SELECT id, name FROM users 
        WHERE role = 'coach' OR role = 'admin' OR role = 'super_admin'
        ORDER BY name ASC
      `, { isPublicQuery: true });
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.rows || [];
    }
  });
  
  // Query for evaluation results when form is submitted
  const { 
    data: evaluationResult, 
    isLoading: isLoadingResult,
    error
  } = useQuery({
    queryKey: ['memberEvaluation', memberName, memberCode, coachId, submitted],
    queryFn: async () => {
      if (!submitted) return null;
      
      if (!memberName || !memberCode || !coachId) {
        throw new Error('Please fill in all fields');
      }
      
      const result = await executeSql(`
        SELECT e.id, e.status, e.nominated_at, e.evaluation_date, e.evaluation_result,
               m.name as member_name, m.member_id as member_code,
               u.name as coach_name
        FROM evaluations e
        JOIN members m ON e.member_id = m.id
        JOIN users u ON e.coach_id = u.id
        WHERE LOWER(m.name) = LOWER('${memberName.trim()}')
        AND LOWER(m.member_id) = LOWER('${memberCode.trim()}')
        AND e.coach_id = ${coachId}
        ORDER BY e.evaluation_date DESC
        LIMIT 1
      `, { isPublicQuery: true });
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      if (!result.rows || result.rows.length === 0) {
        throw new Error('No evaluation found with the provided details. Please check your information and try again.');
      }
      
      return result.rows[0];
    },
    enabled: submitted,
    retry: false,
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      setSubmitted(false);
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };
  
  const resetForm = () => {
    setMemberName('');
    setMemberCode('');
    setCoachId('');
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Check Your Evaluation Results</h1>
        
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Enter Your Details</CardTitle>
              <CardDescription>
                Please enter your exact name and membership number as they appear in our records,
                and select your coach to check your evaluation status.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="memberName">Your Full Name</Label>
                  <Input 
                    id="memberName"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="Enter your exact full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="memberCode">Your Membership Number</Label>
                  <Input 
                    id="memberCode"
                    value={memberCode}
                    onChange={(e) => setMemberCode(e.target.value)}
                    placeholder="Enter your SH number"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="coach">Your Coach</Label>
                  <Select
                    value={coachId}
                    onValueChange={setCoachId}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your coach" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCoaches ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Loading coaches...</span>
                        </div>
                      ) : (
                        coaches?.map((coach: Coach) => (
                          <SelectItem key={coach.id} value={coach.id.toString()}>
                            {coach.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button type="submit" className="w-full mt-4" disabled={isLoadingResult}>
                  {isLoadingResult ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : 'Check Results'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {submitted && evaluationResult && (
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
                <Button variant="outline" onClick={resetForm} className="w-full">
                  Reset
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberEvaluationResults;
