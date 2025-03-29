
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { SortField, SortOrder } from './MembersTableContainer';

interface MembersTableHeaderProps {
  sortField: SortField;
  sortOrder: SortOrder;
  handleSort: (field: SortField) => void;
  toggleSelectAll: () => void;
  anyMembersSelected: boolean;
  allMembersSelected: boolean;
}

export const MembersTableHeader: React.FC<MembersTableHeaderProps> = ({
  sortField,
  sortOrder,
  handleSort,
  toggleSelectAll,
  anyMembersSelected,
  allMembersSelected
}) => {
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? 
      <ArrowUp className="inline h-4 w-4 ml-1" /> : 
      <ArrowDown className="inline h-4 w-4 ml-1" />;
  };
  
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">
          <Checkbox 
            checked={allMembersSelected}
            onCheckedChange={toggleSelectAll}
            aria-label="Select all members"
          />
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => handleSort('member_id')}
        >
          Member ID {renderSortIndicator('member_id')}
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => handleSort('name')}
        >
          Name {renderSortIndicator('name')}
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => handleSort('level_code')}
        >
          Level {renderSortIndicator('level_code')}
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => handleSort('classes_count')}
        >
          Classes {renderSortIndicator('classes_count')}
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => handleSort('coach_name')}
        >
          Coach {renderSortIndicator('coach_name')}
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => handleSort('evaluation_date')}
        >
          Evaluation Date {renderSortIndicator('evaluation_date')}
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
