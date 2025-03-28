
import React from 'react';
import { AlertCircle } from 'lucide-react';

const EmptyEvaluations: React.FC = () => {
  return (
    <div className="text-center py-8">
      <AlertCircle className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
      <p className="text-muted-foreground">
        No pending evaluations found. Either all evaluations have been processed or none have been created yet.
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Admin users can create evaluations from the Admin Panel.
      </p>
    </div>
  );
};

export default EmptyEvaluations;
