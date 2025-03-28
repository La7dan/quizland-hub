
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { getMembers } from '@/services/members/memberService';
import { MemberTable } from './MemberTable';
import { MemberHeader } from './MemberHeader';
import { AddMemberDialog } from './AddMemberDialog';
import { ImportMembersDialog } from './ImportMembersDialog';
import { useBulkDeleteMembers } from './hooks/useBulkDeleteMembers';

export default function MemberManagement({ onRefresh }: { onRefresh?: () => void }) {
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  
  const queryClient = useQueryClient();

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['members'],
    queryFn: getMembers
  });

  const { bulkDeleteMembersMutation } = useBulkDeleteMembers({
    onRefresh,
    onSuccess: () => setSelectedMembers([])
  });

  const openAddMemberDialog = (member?: any) => {
    if (member) {
      setIsEditMode(true);
      setCurrentMember(member);
    } else {
      setIsEditMode(false);
      setCurrentMember(null);
    }
    setIsAddMemberDialogOpen(true);
  };

  const closeAddMemberDialog = () => {
    setIsAddMemberDialogOpen(false);
    setCurrentMember(null);
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
    if (membersData?.members) {
      if (selectedMembers.length === membersData.members.length) {
        setSelectedMembers([]);
      } else {
        setSelectedMembers(membersData.members.map(member => member.id!));
      }
    }
  };

  return (
    <div className="space-y-4">
      <MemberHeader 
        openAddMemberDialog={openAddMemberDialog}
        openImportDialog={() => setIsImportDialogOpen(true)}
        selectedMembers={selectedMembers}
        handleBulkDelete={() => bulkDeleteMembersMutation.mutate(selectedMembers)}
      />

      <MemberTable 
        membersData={membersData}
        membersLoading={membersLoading}
        selectedMembers={selectedMembers}
        toggleMemberSelection={toggleMemberSelection}
        toggleSelectAll={toggleSelectAll}
        openAddMemberDialog={openAddMemberDialog}
        onRefresh={onRefresh}
      />

      <AddMemberDialog 
        isOpen={isAddMemberDialogOpen}
        setIsOpen={setIsAddMemberDialogOpen}
        isEditMode={isEditMode}
        currentMember={currentMember}
        onClose={closeAddMemberDialog}
        onRefresh={onRefresh}
      />

      <ImportMembersDialog 
        isOpen={isImportDialogOpen}
        setIsOpen={setIsImportDialogOpen}
        onRefresh={onRefresh}
      />
    </div>
  );
}
