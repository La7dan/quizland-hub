
import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { exportToCSV } from './utils';
import BulkMarkAsPassedButton from './BulkMarkAsPassedButton';

import { useEvaluationData, useFilterOptions } from './hooks/useEvaluationData';
import { useEvaluationFilters } from './hooks/useEvaluationFilters';
import { useEvaluationSelection } from './hooks/useEvaluationSelection';
import EvaluationTableHeader from './EvaluationTableHeader';
import EvaluationTableRow from './EvaluationTableRow';
import EvaluationFilters from './EvaluationFilters';

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
    return <div className="py-8 text-center">Loading evaluations...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="py-8 text-center">No evaluations found in the database.</div>;
  }

  if (filteredEvaluations.length === 0) {
    return (
      <div className="py-8 text-center">
        No evaluations match the current filters.
        {Object.keys(filters).length > 0 && (
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    );
  }

  const hasLevels = (filterOptions?.levels?.length || 0) > 0;
  const hasCoaches = (filterOptions?.coaches?.length || 0) > 0;

  return (
    <div>
      <EvaluationFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
        onClearFilters={clearFilters}
        onExportCSV={handleExportCSV}
        exportDisabled={filteredEvaluations.length === 0}
      />

      {isAdmin && (
        <div className="flex justify-end mb-4">
          <BulkMarkAsPassedButton 
            selectedIds={selectedIds} 
            onReset={resetSelection} 
          />
        </div>
      )}
      
      <div className="rounded-md border overflow-x-auto">
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
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EvaluationListTab;
