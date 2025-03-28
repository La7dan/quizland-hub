
import { Trash } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MemberResponse } from '@/services/members/memberService';
import { useDeleteMember } from './hooks/useDeleteMember';

interface MemberTableProps {
  membersData?: MemberResponse;
  membersLoading: boolean;
  selectedMembers: number[];
  toggleMemberSelection: (id: number) => void;
  toggleSelectAll: () => void;
  openAddMemberDialog: (member: any) => void;
  onRefresh?: () => void;
}

export const MemberTable = ({
  membersData,
  membersLoading,
  selectedMembers,
  toggleMemberSelection,
  toggleSelectAll,
  openAddMemberDialog,
  onRefresh
}: MemberTableProps) => {
  const { handleDeleteMember } = useDeleteMember({ onRefresh });

  if (membersLoading) {
    return <div className="text-center py-4">Loading members...</div>;
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={membersData?.members && membersData.members.length > 0 && selectedMembers.length === membersData.members.length}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all members"
              />
            </TableHead>
            <TableHead>Member ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Classes</TableHead>
            <TableHead>Coach</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {membersData?.members && membersData.members.length > 0 ? (
            membersData.members.map((member) => (
              <TableRow key={member.id} className={selectedMembers.includes(member.id!) ? "bg-muted/50" : ""}>
                <TableCell>
                  <Checkbox 
                    checked={selectedMembers.includes(member.id!)}
                    onCheckedChange={() => toggleMemberSelection(member.id!)}
                    aria-label={`Select ${member.name}`}
                  />
                </TableCell>
                <TableCell>{member.member_id}</TableCell>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.level_code ? `${member.level_code} - ${member.level_name}` : 'Not assigned'}</TableCell>
                <TableCell>{member.classes_count || 0}</TableCell>
                <TableCell>{member.coach_name || 'Not assigned'}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openAddMemberDialog(member)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMember(member.id!)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No members found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
