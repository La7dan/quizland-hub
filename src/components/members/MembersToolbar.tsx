
import { Button } from '@/components/ui/button';
import { RefreshCw, User, UserMinus, Download } from 'lucide-react';
import { useMemberExport } from './hooks/useMemberExport';

interface MembersToolbarProps {
  selectedMembers: number[];
  handleBulkDelete: () => void;
  handleRefresh: () => void;
  isLoading: boolean;
  hasMembers: boolean;
}

export const MembersToolbar: React.FC<MembersToolbarProps> = ({
  selectedMembers,
  handleBulkDelete,
  handleRefresh,
  isLoading,
  hasMembers
}) => {
  const { exportMembersToCSV } = useMemberExport();

  return (
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
        <Button
          onClick={() => exportMembersToCSV()}
          className="flex items-center gap-1"
          disabled={!hasMembers}
          variant="outline"
          size="sm"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </div>
  );
};
