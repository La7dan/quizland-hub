
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { EvaluationDisplayItem } from './types';
import { handleDownload } from './utils';

interface EvaluationItemProps {
  evaluation: EvaluationDisplayItem;
}

const EvaluationItem: React.FC<EvaluationItemProps> = ({ evaluation }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'disapproved':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  return (
    <div className="grid grid-cols-5 gap-4 p-4 items-center">
      <div className="font-medium">
        {evaluation.member_name}
        <span className="block text-xs text-muted-foreground">
          {evaluation.member_code}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {getStatusIcon(evaluation.status)}
        <span className="capitalize">{evaluation.status}</span>
      </div>
      <div>
        {evaluation.evaluation_date
          ? new Date(evaluation.evaluation_date).toLocaleDateString()
          : "Not set"}
      </div>
      <div>
        {new Date(evaluation.nominated_at).toLocaleDateString()}
      </div>
      <div className="flex space-x-2">
        {evaluation.evaluation_pdf && (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1"
            onClick={() => handleDownload(evaluation.evaluation_pdf!)}
          >
            <Download className="h-3 w-3" />
            <span>Download</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default EvaluationItem;
