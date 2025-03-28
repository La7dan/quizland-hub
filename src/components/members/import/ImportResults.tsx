
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImportResultsProps {
  errors: string[];
  success: boolean;
}

export const ImportResults = ({ errors, success }: ImportResultsProps) => {
  if (errors.length === 0 && !success) {
    return null;
  }

  return (
    <>
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div>The following errors occurred during import:</div>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Members imported successfully!
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
