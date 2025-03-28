
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { executeSql } from '@/services/apiService';

export const useEvaluationDeletion = (onResetSelection: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Delete mutations
  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const query = `DELETE FROM evaluations WHERE id IN (${ids.join(',')}) RETURNING id`;
      return await executeSql(query);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Selected evaluation(s) deleted successfully`,
      });
      onResetSelection();
      queryClient.invalidateQueries({ queryKey: ['allEvaluations'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete evaluations: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
    }
  });

  // Handle bulk delete
  const handleBulkDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = (ids: number[]) => {
    if (ids.length > 0) {
      deleteMutation.mutate(ids);
    }
  };
  
  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    deleteMutation,
    handleBulkDelete,
    confirmDelete
  };
};
