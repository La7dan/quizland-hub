
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { SortAsc, SortDesc, ArrowUpDown } from 'lucide-react';
import { SortField, SortOrder } from '../hooks/useEvaluationFilters';

interface EvaluationTableHeaderProps {
  isAdmin: boolean;
  sortField: SortField;
  sortOrder: SortOrder;
  toggleSort: (field: SortField) => void;
  onSelectAll: (checked: boolean) => void;
  hasLevels: boolean;
  hasCoaches: boolean;
  allSelected: boolean;
}

const EvaluationTableHeader: React.FC<EvaluationTableHeaderProps> = ({
  isAdmin,
  sortField,
  sortOrder,
  toggleSort,
  onSelectAll,
  hasLevels,
  hasCoaches,
  allSelected
}) => {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4 inline" />;
    }
    return sortOrder === 'asc' 
      ? <SortAsc className="ml-1 h-4 w-4 inline text-primary" /> 
      : <SortDesc className="ml-1 h-4 w-4 inline text-primary" />;
  };

  return (
    <TableHeader>
      <TableRow>
        {isAdmin && (
          <TableHead className="w-12">
            <Checkbox 
              checked={allSelected}
              onCheckedChange={onSelectAll}
            />
          </TableHead>
        )}
        <TableHead className="cursor-pointer" onClick={() => toggleSort('member_name')}>
          Member {getSortIcon('member_name')}
        </TableHead>
        {hasLevels && (
          <TableHead>Level</TableHead>
        )}
        <TableHead className="cursor-pointer" onClick={() => toggleSort('status')}>
          Status {getSortIcon('status')}
        </TableHead>
        <TableHead className="cursor-pointer" onClick={() => toggleSort('evaluation_result')}>
          Result {getSortIcon('evaluation_result')}
        </TableHead>
        <TableHead className="cursor-pointer" onClick={() => toggleSort('nominated_at')}>
          Nominated {getSortIcon('nominated_at')}
        </TableHead>
        <TableHead className="cursor-pointer" onClick={() => toggleSort('evaluation_date')}>
          Evaluation Date {getSortIcon('evaluation_date')}
        </TableHead>
        {hasCoaches && (
          <TableHead>Coach</TableHead>
        )}
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default EvaluationTableHeader;
