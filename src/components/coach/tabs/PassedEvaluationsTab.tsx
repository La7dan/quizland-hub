
import React from 'react';
import PendingEvaluationsList from '../PendingEvaluationsList';
import LoadingEvaluations from '../LoadingEvaluations';
import { Evaluation } from '@/services/evaluations/types';

interface PassedEvaluationsTabProps {
  allEvaluationsLoading: boolean;
  passedEvaluations: Evaluation[];
}

const PassedEvaluationsTab: React.FC<PassedEvaluationsTabProps> = ({
  allEvaluationsLoading,
  passedEvaluations,
}) => {
  return (
    <>
      {allEvaluationsLoading ? (
        <LoadingEvaluations />
      ) : passedEvaluations.length > 0 ? (
        <PendingEvaluationsList evaluations={passedEvaluations} showAll={true} />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No passed evaluations found.</p>
        </div>
      )}
    </>
  );
};

export default PassedEvaluationsTab;
