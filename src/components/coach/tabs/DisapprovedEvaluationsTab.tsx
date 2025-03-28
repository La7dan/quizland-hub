
import React from 'react';
import PendingEvaluationsList from '../PendingEvaluationsList';
import LoadingEvaluations from '../LoadingEvaluations';
import { Evaluation } from '@/services/evaluations/types';

interface DisapprovedEvaluationsTabProps {
  allEvaluationsLoading: boolean;
  disapprovedEvaluations: Evaluation[];
}

const DisapprovedEvaluationsTab: React.FC<DisapprovedEvaluationsTabProps> = ({
  allEvaluationsLoading,
  disapprovedEvaluations,
}) => {
  return (
    <>
      {allEvaluationsLoading ? (
        <LoadingEvaluations />
      ) : disapprovedEvaluations.length > 0 ? (
        <PendingEvaluationsList evaluations={disapprovedEvaluations} showAll={true} />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No disapproved evaluations found.</p>
        </div>
      )}
    </>
  );
};

export default DisapprovedEvaluationsTab;
