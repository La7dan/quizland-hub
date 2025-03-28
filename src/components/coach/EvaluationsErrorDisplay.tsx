
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EvaluationsErrorDisplay: React.FC = () => {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Failed to load evaluations. Please try again later.
      </AlertDescription>
    </Alert>
  );
};

export default EvaluationsErrorDisplay;
