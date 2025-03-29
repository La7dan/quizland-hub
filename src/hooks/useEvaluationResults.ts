
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { executeSql } from '@/services/apiService';
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

export const useEvaluationResults = () => {
  const { toast } = useToast();
  const [memberCode, setMemberCode] = useState('');
  const [coachId, setCoachId] = useState('');
  const [evaluationDate, setEvaluationDate] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  
  // Fetch coaches for the dropdown
  const { 
    data: coaches, 
    isLoading: isLoadingCoaches 
  } = useQuery({
    queryKey: ['coaches'],
    queryFn: async () => {
      console.log('Fetching coaches from database');
      const result = await executeSql(`
        SELECT id, username as name FROM users 
        WHERE role = 'coach' OR role = 'admin' OR role = 'super_admin'
        ORDER BY username ASC
      `, { isPublicQuery: true });
      
      if (!result.success) {
        console.error('Error fetching coaches:', result.message);
        throw new Error(result.message);
      }
      
      console.log('Coaches fetched successfully:', result.rows?.length || 0);
      return result.rows || [];
    }
  });
  
  // Query for evaluation results when form is submitted
  const { 
    data: evaluationResult, 
    isLoading: isLoadingResult,
    error
  } = useQuery({
    queryKey: ['memberEvaluation', memberCode, coachId, evaluationDate, submitted],
    queryFn: async () => {
      if (!submitted) return null;
      
      if (!memberCode || !coachId) {
        throw new Error('Please fill in the required fields');
      }
      
      console.log('Fetching evaluation results for:', { memberCode, coachId, evaluationDate });
      
      // Build the SQL query based on whether evaluationDate is provided
      // Make sure all column references use table aliases
      let query = `
        SELECT e.id, e.status, e.nominated_at, e.evaluation_date, e.evaluation_result,
               m.name as member_name, m.member_id as member_code,
               u.name as coach_name
        FROM evaluations e
        JOIN members m ON e.member_id = m.id
        JOIN users u ON e.coach_id = u.id
        WHERE LOWER(m.member_id) = LOWER($1)
        AND e.coach_id = $2`;
      
      // Parameters to be passed to the query
      const params = [memberCode.trim(), coachId];
      
      // Add date filter if provided
      if (evaluationDate) {
        query += ` AND e.evaluation_date = $3`;
        params.push(evaluationDate);
      }
      
      // Complete the query with ordering
      query += ` ORDER BY e.evaluation_date DESC LIMIT 1`;
      
      const result = await executeSql(query, { 
        params: params,
        isPublicQuery: true 
      });
      
      if (!result.success) {
        console.error('Error fetching evaluation:', result.message);
        throw new Error(result.message);
      }
      
      if (!result.rows || result.rows.length === 0) {
        console.warn('No evaluation found for:', { memberCode, coachId, evaluationDate });
        throw new Error('No evaluation found with the provided details. Please check your information and try again.');
      }
      
      console.log('Evaluation result found:', result.rows[0]);
      return result.rows[0];
    },
    enabled: submitted,
    retry: false,
    meta: {
      onError: (err: Error) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
        setSubmitted(false);
      }
    }
  });
  
  // Effect to handle errors from the query
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      setSubmitted(false);
    }
  }, [error, toast]);
  
  const handleSubmit = (formMemberCode: string, formCoachId: string, formEvaluationDate: string | null) => {
    setMemberCode(formMemberCode);
    setCoachId(formCoachId);
    setEvaluationDate(formEvaluationDate);
    setSubmitted(true);
  };
  
  const resetForm = () => {
    setMemberCode('');
    setCoachId('');
    setEvaluationDate(null);
    setSubmitted(false);
  };

  return {
    coaches,
    evaluationResult,
    isLoadingCoaches,
    isLoadingResult,
    handleSubmit,
    resetForm,
    submitted
  };
};
