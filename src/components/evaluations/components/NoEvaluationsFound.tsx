
import React from 'react';
import { FileCheck } from 'lucide-react';

interface NoEvaluationsFoundProps {
  searchTerm: string;
}

const NoEvaluationsFound: React.FC<NoEvaluationsFoundProps> = ({ searchTerm }) => {
  return (
    <div className="text-center py-12 border-2 border-dashed rounded-lg border-muted">
      <FileCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-2 text-lg font-semibold">No completed evaluations found</h3>
      <p className="text-muted-foreground mt-1">
        {searchTerm
          ? "Try changing your search"
          : "Mark evaluations as 'completed' or add a result to see them here"}
      </p>
    </div>
  );
};

export default NoEvaluationsFound;
