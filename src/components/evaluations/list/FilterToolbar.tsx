
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
          sortField={'nominated_at'} // Provide default sortField
          sortOrder={'desc'} // Provide default sortOrder
          toggleSort={() => {}} // Provide empty function
          filters={{
            status: filters.status || 'all', // Always provide status
            level: filters.level, // Optional level
            result: filters.result // Optional result
          }}
          setFilters={setFilters}
          clearFilters={onClearFilters} // Changed from onClearFilters to clearFilters
          filterOptions={filterOptions}
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
