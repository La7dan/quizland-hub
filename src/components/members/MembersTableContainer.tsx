
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMembers, Member, MemberResponse } from '@/services/members/memberService';
import { useToast } from '@/hooks/use-toast';
import { MembersTableHeader } from './MembersTableHeader';
import { MembersTable } from './MembersTable';
import { MembersSearchFilter } from './MembersSearchFilter';
import { MembersToolbar } from './MembersToolbar';
import { useBulkDeleteMembers } from './hooks/useBulkDeleteMembers';
import { useDuplicateMemberDetection } from './DuplicateMemberDetector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface MembersTableContainerProps {
  onRefresh?: () => void;
}

export type SortField = 'name' | 'member_id' | 'level_code' | 'classes_count' | 'coach_name' | 'evaluation_date';
export type SortOrder = 'asc' | 'desc';

const MembersTableContainer: React.FC<MembersTableContainerProps> = ({ onRefresh }) => {
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error: queryError, refetch } = useQuery({
    queryKey: ['members'],
    queryFn: getMembers
  });

  const members = data?.members || [];
  const error = queryError ? String(queryError) : (data?.message && !data.success ? data.message : null);

  // Use our duplicate detection hook
  const { isDuplicate } = useDuplicateMemberDetection(members);

  const { bulkDeleteMembersMutation } = useBulkDeleteMembers({
    onRefresh,
    onSuccess: () => setSelectedMembers([])
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

  const toggleSelectAll = (filteredMembers: Member[]) => {
    if (filteredMembers.length > 0) {
      if (selectedMembers.length === filteredMembers.length) {
        setSelectedMembers([]);
      } else {
        setSelectedMembers(filteredMembers.map(member => member.id!));
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
      bulkDeleteMembersMutation.mutate(selectedMembers);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filterMembers = (members: Member[]): Member[] => {
    if (!searchTerm) return members;
    
    const searchLower = searchTerm.toLowerCase();
    return members.filter((member) => (
      member.name?.toLowerCase().includes(searchLower) ||
      member.member_id?.toLowerCase().includes(searchLower) ||
      member.level_code?.toLowerCase().includes(searchLower) ||
      member.coach_name?.toLowerCase().includes(searchLower)
    ));
  };

  const sortMembers = (members: Member[]): Member[] => {
    return [...members].sort((a, b) => {
      let aVal = a[sortField as keyof Member];
      let bVal = b[sortField as keyof Member];
      
      aVal = aVal === undefined || aVal === null ? '' : aVal;
      bVal = bVal === undefined || bVal === null ? '' : bVal;
      
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const filteredMembers = filterMembers(members);
  const sortedMembers = sortMembers(filteredMembers);

  return (
    <div className="space-y-4">
      <MembersHeader 
        selectedMembers={selectedMembers}
        handleBulkDelete={handleBulkDelete}
        handleRefresh={handleRefresh}
        isLoading={isLoading}
        members={members}
      />

      <MembersSearchFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <MembersTable
        isLoading={isLoading}
        members={members}
        sortedMembers={sortedMembers}
        selectedMembers={selectedMembers}
        sortField={sortField}
        sortOrder={sortOrder}
        handleSort={handleSort}
        toggleMemberSelection={toggleMemberSelection}
        toggleSelectAll={() => toggleSelectAll(sortedMembers)}
        isDuplicate={isDuplicate}
      />
    </div>
  );
};

const MembersHeader = ({ 
  selectedMembers, 
  handleBulkDelete, 
  handleRefresh, 
  isLoading,
  members
}: { 
  selectedMembers: number[], 
  handleBulkDelete: () => void, 
  handleRefresh: () => void, 
  isLoading: boolean,
  members: Member[]
}) => {
  return (
    <MembersToolbar 
      selectedMembers={selectedMembers}
      handleBulkDelete={handleBulkDelete}
      handleRefresh={handleRefresh}
      isLoading={isLoading}
      hasMembers={members.length > 0}
    />
  );
};

export default MembersTableContainer;
