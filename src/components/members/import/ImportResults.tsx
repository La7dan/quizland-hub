
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ImportResultsProps {
  errors: string[];
  success: boolean;
  result?: 'passed' | 'not_ready';
}

export const ImportResults = ({ errors, success, result }: ImportResultsProps) => {
  if (errors.length === 0 && !success) {
    return null;
  }

  return (
    <div className="space-y-3">
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
        <Alert variant={result === 'not_ready' ? "destructive" : "default"} className={result === 'passed' ? "border-green-200 bg-green-50" : ""}>
          <CheckCircle className={`h-4 w-4 ${result === 'passed' ? "text-green-600" : ""}`} />
          <AlertDescription className="flex items-center gap-2">
            <span>
              {result === 'not_ready' 
                ? "Member marked as Not Ready successfully!" 
                : "Member marked as Passed successfully!"}
            </span>
            {result && (
              <Badge 
                variant="outline"
                className={result === 'not_ready' 
                  ? "bg-red-100 text-red-800 border-red-200" 
                  : "bg-green-100 text-green-800 border-green-200"}
              >
                {result === 'not_ready' ? "Not Ready" : "Passed"}
              </Badge>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
