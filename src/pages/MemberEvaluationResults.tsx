
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { EvaluationResultsForm, EvaluationResultsDisplay } from '@/components/evaluation-results';
import { useEvaluationResults } from '@/hooks/useEvaluationResults';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AuthRedirect from '@/components/evaluations/list/AuthRedirect';

const MemberEvaluationResults: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Redirect non-superadmins
  useEffect(() => {
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only super admins can access evaluation results.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [isSuperAdmin, navigate, toast]);
  
  const {
    coaches,
    evaluationResult,
    isLoadingCoaches,
    isLoadingResult,
    handleSubmit,
    resetForm,
    submitted
  } = useEvaluationResults();

  // Use the AuthRedirect component to handle access control
  return (
    <AuthRedirect isAdmin={isSuperAdmin}>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container py-10">
          <h1 className="text-3xl font-bold mb-6">Check Your Evaluation Results</h1>
          
          <div className="grid gap-8 md:grid-cols-2">
            <EvaluationResultsForm
              coaches={coaches}
              isLoadingCoaches={isLoadingCoaches}
              isLoadingResult={isLoadingResult}
              onSubmit={handleSubmit}
            />
            
            {submitted && evaluationResult && (
              <EvaluationResultsDisplay
                evaluationResult={evaluationResult}
                onReset={resetForm}
              />
            )}
          </div>
        </div>
      </div>
    </AuthRedirect>
  );
};

export default MemberEvaluationResults;
