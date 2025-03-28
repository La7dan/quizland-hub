
import React from 'react';
import PendingEvaluationsList from '../PendingEvaluationsList';
import LoadingEvaluations from '../LoadingEvaluations';
import EmptyEvaluations from '../EmptyEvaluations';
import EvaluationsErrorDisplay from '../EvaluationsErrorDisplay';
import { Evaluation } from '@/services/evaluations/types';

interface PendingEvaluationsTabProps {
  isLoading: boolean;
  error: Error | null;
  evaluations: Evaluation[] | undefined;
  hasConnectionError: boolean;
}

const PendingEvaluationsTab: React.FC<PendingEvaluationsTabProps> = ({
  isLoading,
  error,
  evaluations,
  hasConnectionError,
}) => {
  return (
    <>
      {isLoading ? (
        <LoadingEvaluations />
      ) : error && !hasConnectionError ? (
        <EvaluationsErrorDisplay />
      ) : evaluations && evaluations.length > 0 ? (
        <PendingEvaluationsList evaluations={evaluations} />
      ) : (
        <EmptyEvaluations />
      )}
    </>
  );
};

export default PendingEvaluationsTab;
