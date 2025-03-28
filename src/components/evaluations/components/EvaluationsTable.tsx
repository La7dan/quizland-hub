
import React from 'react';
import { EvaluationDisplayItem } from '../types';
import EvaluationsTableHeader from './EvaluationsTableHeader';
import EvaluationRow from './EvaluationRow';

interface EvaluationsTableProps {
  evaluations: EvaluationDisplayItem[];
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

const EvaluationsTable: React.FC<EvaluationsTableProps> = ({
  evaluations,
  onDelete,
  isDeleting
}) => {
  if (!evaluations.length) return null;
  
  return (
    <div className="border rounded-md">
      <EvaluationsTableHeader />
      <div className="divide-y">
        {evaluations.map((evaluation) => (
          <EvaluationRow 
            key={evaluation.id} 
            evaluation={evaluation} 
            onDelete={onDelete} 
            isDeleting={isDeleting}
          />
        ))}
      </div>
    </div>
  );
};

export default EvaluationsTable;
