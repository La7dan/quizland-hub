
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface UseBulkDeleteUsersOptions {
  onRefresh?: () => void;
  onSuccess?: () => void;
}

export const useBulkDeleteUsers = ({ onRefresh, onSuccess }: UseBulkDeleteUsersOptions) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bulkDeleteUsersMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      // Fixed API URL to include port 8080
      const response = await fetch('http://209.74.89.41:8080/api/users/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete users');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Success',
        description: `Selected users deleted successfully`,
      });
      if (onRefresh) onRefresh();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete users: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  return { bulkDeleteUsersMutation };
};
