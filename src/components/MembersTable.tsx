
import React, { useState, useEffect } from 'react';
import { getMembers, Member, deleteMember } from '@/services/members/memberService';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertCircle, User, Trash, UserMinus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface MembersTableProps {
  onRefresh?: () => void;
}

const MembersTable: React.FC<MembersTableProps> = ({ onRefresh }) => {
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use React Query for data fetching
  const { data, isLoading, error: queryError, refetch } = useQuery({
    queryKey: ['members'],
    queryFn: getMembers
  });

  const members = data?.members || [];
  const error = queryError ? String(queryError) : (data?.message && !data.success ? data.message : null);

  // Bulk delete members mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      for (const id of ids) {
        await deleteMember(id);
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({
        title: "Success",
        description: `${selectedMembers.length} members deleted successfully`,
      });
      setSelectedMembers([]);
      if (onRefresh) onRefresh();
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: `Failed to delete members: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  const handleRefresh = () => {
    refetch();
    if (onRefresh) onRefresh();
  };

  const toggleMemberSelection = (id: number) => {
    setSelectedMembers(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(memberId => memberId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const toggleSelectAll = () => {
    if (members.length > 0) {
      if (selectedMembers.length === members.length) {
        setSelectedMembers([]);
      } else {
        setSelectedMembers(members.map(member => member.id!));
      }
    }
  };

  const handleBulkDelete = () => {
    if (selectedMembers.length === 0) {
      toast({
        title: "Info",
        description: "No members selected to delete",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedMembers.length} members?`)) {
      bulkDeleteMutation.mutate(selectedMembers);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Members
        </h2>
        <div className="flex gap-2">
          {selectedMembers.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="flex items-center gap-1"
            >
              <UserMinus className="h-4 w-4" />
              Delete Selected ({selectedMembers.length})
            </Button>
          )}
          <Button
            onClick={handleRefresh}
            className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-md text-sm transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No members found. Click the "Setup Database" button to create sample members or add members manually.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={members.length > 0 && selectedMembers.length === members.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all members"
                  />
                </TableHead>
                <TableHead>Member ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Coach</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id} className={selectedMembers.includes(member.id!) ? "bg-muted/50" : ""}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedMembers.includes(member.id!)}
                      onCheckedChange={() => toggleMemberSelection(member.id!)}
                      aria-label={`Select ${member.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{member.member_id}</TableCell>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>
                    {member.level_code ? (
                      <Badge variant="outline" className="bg-blue-50">
                        {member.level_code} - {member.level_name}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>{member.classes_count || 0}</TableCell>
                  <TableCell>
                    {member.coach_name || <span className="text-gray-400">Not assigned</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default MembersTable;
