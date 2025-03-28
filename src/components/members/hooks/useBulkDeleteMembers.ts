
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMember } from '@/services/members/memberService';
import { useToast } from '@/hooks/use-toast';

interface UseBulkDeleteMembersOptions {
  onRefresh?: () => void;
  onSuccess?: () => void;
}

export const useBulkDeleteMembers = ({ onRefresh, onSuccess }: UseBulkDeleteMembersOptions) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bulkDeleteMembersMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      for (const id of ids) {
        await deleteMember(id);
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({
        title: 'Success',
        description: `Selected members deleted successfully`,
      });
      if (onRefresh) onRefresh();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete members: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  return { bulkDeleteMembersMutation };
};
