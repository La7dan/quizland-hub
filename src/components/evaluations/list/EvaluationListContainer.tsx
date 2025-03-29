
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { exportToCSV } from '../utils';
import { EvaluationDisplayItem } from '../types';
import { SortField, SortOrder } from '../hooks/useEvaluationFilters';

// Components
import FilterToolbar from './FilterToolbar';
import EvaluationTable from './EvaluationTable';
import EmptyEvaluationState from '../EmptyEvaluationState';
import LoadingEvaluationState from '../LoadingEvaluationState';

interface EvaluationListContainerProps {
  data: EvaluationDisplayItem[] | undefined;
  isLoading: boolean;
  isAdmin: boolean;
  filterOptions: any;
  refreshTrigger?: number;
  
  // Extracted from hooks
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  filters: any;
  setFilters: (filters: any) => void;
  filteredEvaluations: EvaluationDisplayItem[];
  toggleSort: (field: SortField) => void;
  clearFilters: () => void;
  
  selectedIds: number[];
  handleSelectAll: (checked: boolean) => void;
  handleSelectOne: (id: number, checked: boolean) => void;
  resetSelection: () => void;
  isSelected: (id: number) => boolean;
  allSelected: boolean;
  
  handleBulkDelete: () => void;
  
  // Props for edit functionality
  onEdit: (evaluation: EvaluationDisplayItem) => void;
}

const EvaluationListContainer: React.FC<EvaluationListContainerProps> = ({
  data,
  isLoading,
  isAdmin,
  filterOptions,
  searchTerm,
  setSearchTerm,
  sortField,
  sortOrder,
  filters,
  setFilters,
  filteredEvaluations,
  toggleSort,
  clearFilters,
  selectedIds,
  handleSelectAll,
  handleSelectOne,
  resetSelection,
  isSelected,
  allSelected,
  handleBulkDelete,
  onEdit,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle CSV export
  const handleExportCSV = () => {
    if (!filteredEvaluations || filteredEvaluations.length === 0) return;
    
    const exportData = filteredEvaluations.map((item) => ({
      'Member Name': item.member_name || 'N/A',
      'Member ID': item.member_code || 'N/A',
      'Level': item.member_level || 'N/A',
      'Status': item.status || 'N/A',
      'Result': item.evaluation_result || 'N/A',
      'Coach': item.coach_name || 'N/A',
      'Nominated Date': item.nominated_at ? format(new Date(item.nominated_at), 'PP') : 'N/A',
      'Evaluation Date': item.evaluation_date ? format(new Date(item.evaluation_date), 'PP') : 'N/A'
    }));
    
    exportToCSV(exportData, `evaluations_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // If user isn't admin, don't render anything (they'll be redirected)
  if (!isAdmin) {
    return <LoadingEvaluationState />;
  }

  if (isLoading) {
    return <LoadingEvaluationState />;
  }

  if (!data || data.length === 0) {
    return <EmptyEvaluationState hasData={false} hasFilters={false} onClearFilters={clearFilters} />;
  }

  if (filteredEvaluations.length === 0) {
    return (
      <EmptyEvaluationState 
        hasData={true} 
        hasFilters={Object.keys(filters).length > 0} 
        onClearFilters={clearFilters} 
      />
    );
  }

  const hasLevels = (filterOptions?.levels?.length || 0) > 0;
  const hasCoaches = (filterOptions?.coaches?.length || 0) > 0;

  return (
    <div>
      <FilterToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
        onClearFilters={clearFilters}
        onExportCSV={handleExportCSV}
        exportDisabled={filteredEvaluations.length === 0}
        selectedIds={selectedIds}
        onDeleteSelected={isAdmin ? handleBulkDelete : undefined}
        onMarkAsPassed={isAdmin ? resetSelection : undefined}
      />
      
      <EvaluationTable
        evaluations={filteredEvaluations}
        isAdmin={isAdmin}
        sortField={sortField}
        sortOrder={sortOrder}
        toggleSort={toggleSort}
        selectedIds={selectedIds}
        handleSelectOne={handleSelectOne}
        handleSelectAll={handleSelectAll}
        isSelected={isSelected}
        allSelected={allSelected}
        hasLevels={hasLevels}
        hasCoaches={hasCoaches}
        onEdit={onEdit}
        onDelete={isAdmin ? handleBulkDelete : undefined}
      />
    </div>
  );
};

export default EvaluationListContainer;
