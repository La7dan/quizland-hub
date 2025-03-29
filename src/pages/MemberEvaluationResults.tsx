
import React from 'react';
import Navigation from '@/components/Navigation';
import { EvaluationResultsForm, EvaluationResultsDisplay } from '@/components/evaluation-results';
import { useEvaluationResults } from '@/hooks/useEvaluationResults';

const MemberEvaluationResults: React.FC = () => {
  const {
    coaches,
    evaluationResult,
    isLoadingCoaches,
    isLoadingResult,
    handleSubmit,
    resetForm,
    submitted
  } = useEvaluationResults();

  return (
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
  );
};

export default MemberEvaluationResults;
