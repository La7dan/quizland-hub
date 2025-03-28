
import React from 'react';
import PendingEvaluationsList from '../PendingEvaluationsList';
import LoadingEvaluations from '../LoadingEvaluations';
import { Evaluation } from '@/services/evaluations/types';

interface AllEvaluationsTabProps {
  allEvaluationsLoading: boolean;
  allEvaluations: Evaluation[] | undefined;
  hasConnectionError: boolean;
}

const AllEvaluationsTab: React.FC<AllEvaluationsTabProps> = ({
  allEvaluationsLoading,
  allEvaluations,
  hasConnectionError,
}) => {
  return (
    <>
      {allEvaluationsLoading ? (
        <LoadingEvaluations />
      ) : allEvaluations && allEvaluations.length > 0 ? (
        <PendingEvaluationsList evaluations={allEvaluations} showAll={true} />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {hasConnectionError 
              ? "Unable to load evaluations due to connection issues." 
              : "No evaluations found. Create evaluations for your members to get started."}
          </p>
        </div>
      )}
    </>
  );
};

export default AllEvaluationsTab;
