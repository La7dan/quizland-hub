
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMember } from '@/services/members/memberService';
import { useToast } from '@/hooks/use-toast';

interface UseDeleteMemberOptions {
  onRefresh?: () => void;
}

export const useDeleteMember = ({ onRefresh }: UseDeleteMemberOptions) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMemberMutation = useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({
        title: 'Success',
        description: 'Member deleted successfully',
      });
      if (onRefresh) onRefresh();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete member: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  const handleDeleteMember = (id: number) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      deleteMemberMutation.mutate(id);
    }
  };

  return { handleDeleteMember, deleteMemberMutation };
};
