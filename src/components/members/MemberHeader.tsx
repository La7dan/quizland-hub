
import { Button } from '@/components/ui/button';
import { Upload, UserMinus, Users } from 'lucide-react';

interface MemberHeaderProps {
  openAddMemberDialog: () => void;
  openImportDialog: () => void;
  selectedMembers: number[];
  handleBulkDelete: () => void;
}

export const MemberHeader = ({
  openAddMemberDialog,
  openImportDialog,
  selectedMembers,
  handleBulkDelete
}: MemberHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <h2 className="text-xl font-semibold flex items-center">
        <Users className="mr-2 h-5 w-5" />
        Member Management
      </h2>
      <div className="flex flex-wrap gap-2">
        <Button onClick={openAddMemberDialog} size="sm">
          Add Member
        </Button>
        <Button onClick={openImportDialog} variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
        {selectedMembers.length > 0 && (
          <Button onClick={handleBulkDelete} variant="destructive" size="sm">
            <UserMinus className="h-4 w-4 mr-2" />
            Delete Selected ({selectedMembers.length})
          </Button>
        )}
      </div>
    </div>
  );
};
