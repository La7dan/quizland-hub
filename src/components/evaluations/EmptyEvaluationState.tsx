
import React from 'react';
import { Button } from '@/components/ui/button';
import { FilterOptions } from './hooks/useEvaluationFilters';

interface EmptyEvaluationStateProps {
  hasData: boolean;
  hasFilters: boolean;
  onClearFilters: () => void;
}

const EmptyEvaluationState: React.FC<EmptyEvaluationStateProps> = ({ 
  hasData, 
  hasFilters,
  onClearFilters
}) => {
  if (hasData) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No evaluations match the current filters.</p>
        {hasFilters && (
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="py-8 text-center">
      <p className="text-muted-foreground">No evaluations found in the database.</p>
    </div>
  );
};

export default EmptyEvaluationState;
