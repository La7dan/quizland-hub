
import React from 'react';
import PendingEvaluationsList from '../PendingEvaluationsList';
import LoadingEvaluations from '../LoadingEvaluations';
import { Evaluation } from '@/services/evaluations/types';

interface ApprovedEvaluationsTabProps {
  allEvaluationsLoading: boolean;
  approvedEvaluations: Evaluation[];
}

const ApprovedEvaluationsTab: React.FC<ApprovedEvaluationsTabProps> = ({
  allEvaluationsLoading,
  approvedEvaluations,
}) => {
  return (
    <>
      {allEvaluationsLoading ? (
        <LoadingEvaluations />
      ) : approvedEvaluations.length > 0 ? (
        <PendingEvaluationsList evaluations={approvedEvaluations} showAll={true} />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No approved evaluations found.</p>
        </div>
      )}
    </>
  );
};

export default ApprovedEvaluationsTab;
