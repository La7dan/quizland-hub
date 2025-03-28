
import React from 'react';

interface EvaluationsTableHeaderProps {
  // No specific props needed for this component
}

const EvaluationsTableHeader: React.FC<EvaluationsTableHeaderProps> = () => {
  return (
    <div className="grid grid-cols-6 gap-4 border-b bg-muted/50 p-4 font-medium">
      <div>Member</div>
      <div>Status</div>
      <div>Evaluation Date</div>
      <div>Nominated Date</div>
      <div>Result</div>
      <div className="text-right">Actions</div>
    </div>
  );
};

export default EvaluationsTableHeader;
