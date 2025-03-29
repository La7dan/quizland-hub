
import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { EvaluationDisplayItem } from '../types';
import EvaluationTableHeader from './EvaluationTableHeader';
import EvaluationTableRow from '../EvaluationTableRow';
import { SortField, SortOrder } from '../hooks/useEvaluationFilters';

interface EvaluationTableProps {
  evaluations: EvaluationDisplayItem[];
  isAdmin: boolean;
  sortField: SortField;
  sortOrder: SortOrder;
  toggleSort: (field: SortField) => void;
  selectedIds: number[];
  handleSelectOne: (id: number, checked: boolean) => void;
  handleSelectAll: (checked: boolean) => void;
  isSelected: (id: number) => boolean;
  allSelected: boolean;
  hasLevels: boolean;
  hasCoaches: boolean;
  onEdit?: (evaluation: EvaluationDisplayItem) => void;
  onDelete?: (ids: number[]) => void;
}

const EvaluationTable: React.FC<EvaluationTableProps> = ({
  evaluations,
  isAdmin,
  sortField,
  sortOrder,
  toggleSort,
  selectedIds,
  handleSelectOne,
  handleSelectAll,
  isSelected,
  allSelected,
  hasLevels,
  hasCoaches,
  onEdit,
  onDelete
}) => {
  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <EvaluationTableHeader
            isAdmin={isAdmin}
            sortField={sortField}
            sortOrder={sortOrder}
            toggleSort={toggleSort}
            onSelectAll={handleSelectAll}
            hasLevels={hasLevels}
            hasCoaches={hasCoaches}
            allSelected={allSelected}
          />
          
          <TableBody>
            {evaluations.map(evaluation => (
              <EvaluationTableRow
                key={evaluation.id}
                evaluation={evaluation}
                isAdmin={isAdmin}
                isSelected={isSelected(evaluation.id)}
                onSelectOne={handleSelectOne}
                hasLevels={hasLevels}
                hasCoaches={hasCoaches}
                onEdit={isAdmin && onEdit ? () => onEdit(evaluation) : undefined}
                onDelete={isAdmin && onDelete ? () => onDelete([evaluation.id]) : undefined}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EvaluationTable;
