
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { bulkMarkEvaluationsAsPassed } from '@/services/evaluations/evaluationService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BulkMarkAsPassedButtonProps {
  selectedIds: number[];
  disabled?: boolean;
  onReset?: () => void;
}

const BulkMarkAsPassedButton: React.FC<BulkMarkAsPassedButtonProps> = ({ 
  selectedIds, 
  disabled = false,
  onReset 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const markAsPassedMutation = useMutation({
    mutationFn: (ids: number[]) => bulkMarkEvaluationsAsPassed(ids),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['pendingEvaluations'] });
        queryClient.invalidateQueries({ queryKey: ['allEvaluations'] });
        
        // Reset selection if callback provided
        if (onReset) {
          onReset();
        }
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
      
      setIsConfirmOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      setIsConfirmOpen(false);
    }
  });

  const handleConfirmMarkAsPassed = () => {
    markAsPassedMutation.mutate(selectedIds);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        disabled={disabled || selectedIds.length === 0 || markAsPassedMutation.isPending}
        onClick={() => setIsConfirmOpen(true)}
      >
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span>Mark {selectedIds.length} as Passed</span>
      </Button>
      
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark {selectedIds.length} evaluation{selectedIds.length !== 1 ? 's' : ''} as passed?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmMarkAsPassed}>
              {markAsPassedMutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BulkMarkAsPassedButton;
