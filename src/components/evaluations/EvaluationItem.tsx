
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Download, Edit } from 'lucide-react';
import { EvaluationDisplayItem } from './types';
import { handleDownload } from './utils';
import { useAuth } from '@/contexts/AuthContext';
import EditEvaluationDialog from './EditEvaluationDialog';

interface EvaluationItemProps {
  evaluation: EvaluationDisplayItem;
}

const EvaluationItem: React.FC<EvaluationItemProps> = ({ evaluation }) => {
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

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

  // Don't render anything for admin users - they'll use the edit/delete in the table row
  if (isAdmin) {
    return null;
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8 gap-1"
        onClick={() => setIsEditDialogOpen(true)}
      >
        <Edit className="h-3 w-3" />
        <span>Edit</span>
      </Button>
      
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
      
      <EditEvaluationDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        evaluation={evaluation}
      />
    </>
  );
};

export default EvaluationItem;
