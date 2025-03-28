
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import DisapprovalDialog from './DisapprovalDialog';
import { approveEvaluation } from '@/services/evaluations'; // Updated import
import { ENV } from '@/config/env';

interface EvaluationActionsProps {
  evaluationId: number;
  pdfFileName?: string | null;
  status?: string;
  showAll?: boolean;
}

// Get API_BASE_URL without the "/api" part for file uploads
const API_BASE_URL = ENV.API_BASE_URL.replace('/api', '');

const EvaluationActions: React.FC<EvaluationActionsProps> = ({ 
  evaluationId, 
  pdfFileName, 
  status,
  showAll = false 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // We no longer check for isCompleted to enable actions
  // This allows coaches to approve/disapprove even after setting result

  // Approve evaluation mutation
  const approveMutation = useMutation({
    mutationFn: (evaluationId: number) => approveEvaluation(evaluationId),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        queryClient.invalidateQueries({ queryKey: ['pendingEvaluations'] });
        queryClient.invalidateQueries({ queryKey: ['allEvaluations'] });
        queryClient.invalidateQueries({ queryKey: ['completedEvaluations'] });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    }
  });

  // Handle approve
  const handleApprove = () => {
    approveMutation.mutate(evaluationId);
  };

  // Handle PDF download/view
  const handleViewPdf = () => {
    if (!pdfFileName) return;
    
    // Ensure we have the proper URL format
    const fileUrl = pdfFileName.startsWith('http') 
      ? pdfFileName 
      : `${API_BASE_URL}/files/${pdfFileName}`;
      
    window.open(fileUrl, '_blank');
  };

  return (
    <div className="flex justify-end gap-2">
      {pdfFileName && (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleViewPdf}
        >
          <FileText className="h-4 w-4 text-blue-500" />
          PDF
        </Button>
      )}
      
      {/* Always show approve/disapprove buttons */}
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={handleApprove}
        disabled={approveMutation.isPending}
      >
        <CheckCircle className="h-4 w-4 text-green-500" />
        {showAll && status === 'approved' ? 'Approved' : 'Approve'}
      </Button>
      
      <DisapprovalDialog 
        evaluationId={evaluationId} 
        showStatus={showAll && status === 'disapproved'} 
      />
    </div>
  );
};

export default EvaluationActions;
