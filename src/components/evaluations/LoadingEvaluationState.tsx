
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingEvaluationState: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="text-center py-2 text-muted-foreground mb-4">Loading evaluations...</div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-3 border rounded-md">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-3 w-[100px]" />
          </div>
          <Skeleton className="h-8 w-[80px]" />
        </div>
      ))}
    </div>
  );
};

export default LoadingEvaluationState;
