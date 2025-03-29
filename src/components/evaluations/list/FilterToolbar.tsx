
import React from 'react';
import { EvaluationFilters } from '../EvaluationFilters';
import BulkMarkAsPassedButton from '../BulkMarkAsPassedButton';
import { FilterOptions } from '../hooks/useEvaluationFilters';

interface FilterToolbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  filterOptions: any;
  onClearFilters: () => void;
  onExportCSV: () => void;
  exportDisabled: boolean;
  selectedIds: number[];
  onDeleteSelected?: () => void;
  onMarkAsPassed?: () => void;
}

const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  filterOptions,
  onClearFilters,
  onExportCSV,
  exportDisabled,
  selectedIds,
  onDeleteSelected,
  onMarkAsPassed
}) => {
  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <EvaluationFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filters={{
            ...filters,
            status: filters.status || 'all' // Ensure status is required by providing a default
          }}
          setFilters={setFilters}
          filterOptions={filterOptions}
          onClearFilters={onClearFilters}
          onExportCSV={onExportCSV}
          exportDisabled={exportDisabled}
          selectedIds={selectedIds}
          onDeleteSelected={onDeleteSelected}
        />
      </div>

      {selectedIds.length > 0 && onMarkAsPassed && (
        <div className="flex justify-end mb-4">
          <BulkMarkAsPassedButton 
            selectedIds={selectedIds} 
            onReset={onClearFilters} 
          />
        </div>
      )}
    </>
  );
};

export default FilterToolbar;
