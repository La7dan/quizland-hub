
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EvaluationDisplayItem } from './types';

// Components
import DeleteConfirmDialog from './DeleteConfirmDialog';
import EditEvaluationDialog from './EditEvaluationDialog';
import AuthRedirect from './list/AuthRedirect';
import EvaluationListContainer from './list/EvaluationListContainer';

// Hooks
import { useEvaluationData, useFilterOptions } from './hooks/useEvaluationData';
import { useEvaluationFilters } from './hooks/useEvaluationFilters';
import { useEvaluationSelection } from './hooks/useEvaluationSelection';
import { useEvaluationDeletion } from './hooks/useEvaluationDeletion';

interface EvaluationListTabProps {
  refreshTrigger?: number;
}

const EvaluationListTab: React.FC<EvaluationListTabProps> = ({ refreshTrigger }) => {
  const { user, isAdmin } = useAuth();
  
  // State for editing evaluations
  const [editingEvaluation, setEditingEvaluation] = useState<EvaluationDisplayItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
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
  
  // Handle editing an evaluation
  const handleEditEvaluation = (evaluation: EvaluationDisplayItem) => {
    setEditingEvaluation(evaluation);
    setIsEditDialogOpen(true);
  };

  return (
    <AuthRedirect isAdmin={isAdmin}>
      <EvaluationListContainer
        data={data}
        isLoading={isLoading}
        isAdmin={isAdmin}
        filterOptions={filterOptions}
        refreshTrigger={refreshTrigger}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortField={sortField}
        sortOrder={sortOrder}
        filters={filters}
        setFilters={setFilters}
        filteredEvaluations={filteredEvaluations}
        toggleSort={toggleSort}
        clearFilters={clearFilters}
        selectedIds={selectedIds}
        handleSelectAll={handleSelectAll}
        handleSelectOne={handleSelectOne}
        resetSelection={resetSelection}
        isSelected={isSelected}
        allSelected={allSelected}
        handleBulkDelete={handleBulkDelete}
        onEdit={handleEditEvaluation}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => confirmDelete(selectedIds)}
        count={selectedIds.length}
        isPending={deleteMutation.isPending}
      />
      
      <EditEvaluationDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        evaluation={editingEvaluation}
      />
    </AuthRedirect>
  );
};

export default EvaluationListTab;
