
import React from 'react';
import { Member } from '@/services/members/memberService';
import { SortField, SortOrder } from './MembersTableContainer';
import { MembersTableHeader } from './MembersTableHeader';
import { MemberRow } from './MemberRow';
import { Table, TableBody, TableHeader, TableRow, TableCell } from '@/components/ui/table';

interface MembersTableProps {
  isLoading: boolean;
  members: Member[];
  sortedMembers: Member[];
  selectedMembers: number[];
  sortField: SortField;
  sortOrder: SortOrder;
  handleSort: (field: SortField) => void;
  toggleMemberSelection: (id: number) => void;
  toggleSelectAll: () => void;
  isDuplicate?: (memberId?: string) => boolean;
}

export const MembersTable: React.FC<MembersTableProps> = ({
  isLoading,
  members,
  sortedMembers,
  selectedMembers,
  sortField,
  sortOrder,
  handleSort,
  toggleMemberSelection,
  toggleSelectAll,
  isDuplicate = () => false
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No members found. Click the "Setup Database" button to create sample members or add members manually.</p>
      </div>
    );
  }

  if (sortedMembers.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <MembersTableHeader 
            sortField={sortField}
            sortOrder={sortOrder}
            handleSort={handleSort}
            toggleSelectAll={toggleSelectAll}
            anyMembersSelected={false}
            allMembersSelected={false}
          />
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                No members match your search criteria
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <MembersTableHeader 
          sortField={sortField}
          sortOrder={sortOrder}
          handleSort={handleSort}
          toggleSelectAll={toggleSelectAll}
          anyMembersSelected={selectedMembers.length > 0}
          allMembersSelected={sortedMembers.length > 0 && selectedMembers.length === sortedMembers.length}
        />
        <TableBody>
          {sortedMembers.map((member) => (
            <MemberRow 
              key={member.id}
              member={member}
              isSelected={selectedMembers.includes(member.id!)}
              toggleSelection={() => toggleMemberSelection(member.id!)}
              isDuplicate={isDuplicate(member.member_id)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
