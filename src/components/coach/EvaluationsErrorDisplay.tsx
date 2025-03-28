
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EvaluationsErrorDisplay: React.FC = () => {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        There was an error loading evaluations. Please try refreshing the page. If the problem persists, contact support.
      </AlertDescription>
    </Alert>
  );
};

export default EvaluationsErrorDisplay;
