
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorStateProps {
  errorMessage: string;
  onRetry: () => void;
}

export function ErrorState({ errorMessage, onRetry }: ErrorStateProps) {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Connection Error</AlertTitle>
      <AlertDescription>
        <p className="mb-4">{errorMessage}</p>
        <Button onClick={onRetry} variant="outline">
          Retry Connection
        </Button>
      </AlertDescription>
    </Alert>
  );
}
