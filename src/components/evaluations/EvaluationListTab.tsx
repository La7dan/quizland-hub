
import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { exportToCSV } from './utils';

// Components
import EvaluationTableHeader from './EvaluationTableHeader';
import EvaluationTableRow from './EvaluationTableRow';
import EvaluationFilters from './EvaluationFilters';
import BulkMarkAsPassedButton from './BulkMarkAsPassedButton';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import EmptyEvaluationState from './EmptyEvaluationState';
import LoadingEvaluationState from './LoadingEvaluationState';

// Hooks
import { useEvaluationData, useFilterOptions } from './hooks/useEvaluationData';
import { useEvaluationFilters } from './hooks/useEvaluationFilters';
import { useEvaluationSelection } from './hooks/useEvaluationSelection';
import { useEvaluationDeletion } from './hooks/useEvaluationDeletion';

interface EvaluationListTabProps {
  refreshTrigger?: number;
}

const EvaluationListTab: React.FC<EvaluationListTabProps> = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  
  // Fetch data
  const { data, isLoading } = useEvaluationData(refreshTrigger);
  const { data: filterOptions } = useFilterOptions();
  
  // Set up filtering
  const {
    searchTerm,
    setSearchTerm,
    sortField,
    sortOrder,
    filters,
    setFilters,
    filteredEvaluations,
    toggleSort,
    clearFilters
  } = useEvaluationFilters(data);
  
  // Set up selection
  const {
    selectedIds,
    handleSelectAll,
    handleSelectOne,
    resetSelection,
    isSelected,
    allSelected
  } = useEvaluationSelection(filteredEvaluations);

  // Set up deletion
  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    deleteMutation,
    handleBulkDelete,
    confirmDelete
  } = useEvaluationDeletion(resetSelection);

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

  console.log('Rendering evaluation list with:', {
    dataLength: data?.length || 0,
    filteredLength: filteredEvaluations?.length || 0,
    isLoading
  });

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
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <EvaluationFilters
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
        />
      </div>

      {isAdmin && selectedIds.length > 0 && (
        <div className="flex justify-end mb-4">
          <BulkMarkAsPassedButton 
            selectedIds={selectedIds} 
            onReset={resetSelection} 
          />
        </div>
      )}
      
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
              {filteredEvaluations.map(evaluation => (
                <EvaluationTableRow
                  key={evaluation.id}
                  evaluation={evaluation}
                  isAdmin={isAdmin}
                  isSelected={isSelected(evaluation.id)}
                  onSelectOne={handleSelectOne}
                  hasLevels={hasLevels}
                  hasCoaches={hasCoaches}
                  onDelete={isAdmin ? () => {
                    deleteMutation.mutate([evaluation.id]);
                  } : undefined}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => confirmDelete(selectedIds)}
        count={selectedIds.length}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
};

export default EvaluationListTab;
