
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Download, Edit, Trash2 } from 'lucide-react';
import { EvaluationDisplayItem } from './types';
import { handleDownload } from './utils';
import { useAuth } from '@/contexts/AuthContext';
import EditEvaluationDialog from './EditEvaluationDialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { executeSql } from '@/services/apiService';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface EvaluationItemProps {
  evaluation: EvaluationDisplayItem;
}

const EvaluationItem: React.FC<EvaluationItemProps> = ({ evaluation }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const query = `DELETE FROM evaluations WHERE id = ${evaluation.id} RETURNING id`;
      return await executeSql(query);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Evaluation deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['completedEvaluations'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete evaluation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

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
      
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8 gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
        onClick={() => setIsDeleteDialogOpen(true)}
      >
        <Trash2 className="h-3 w-3" />
        <span>Delete</span>
      </Button>
      
      <EditEvaluationDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        evaluation={evaluation}
      />
      
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Evaluation"
        description="Are you sure you want to delete this evaluation? This action cannot be undone."
        onConfirm={() => deleteMutation.mutate()}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </>
  );
};

export default EvaluationItem;
