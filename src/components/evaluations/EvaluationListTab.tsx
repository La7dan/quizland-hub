
import React, { useState } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { exportToCSV } from './utils';
import BulkMarkAsPassedButton from './BulkMarkAsPassedButton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { executeSql } from '@/services/apiService';

import { useEvaluationData, useFilterOptions } from './hooks/useEvaluationData';
import { useEvaluationFilters } from './hooks/useEvaluationFilters';
import { useEvaluationSelection } from './hooks/useEvaluationSelection';
import EvaluationTableHeader from './EvaluationTableHeader';
import EvaluationTableRow from './EvaluationTableRow';
import EvaluationFilters from './EvaluationFilters';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface EvaluationListTabProps {
  refreshTrigger?: number;
}

const EvaluationListTab: React.FC<EvaluationListTabProps> = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
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

  // Delete mutations
  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const query = `DELETE FROM evaluations WHERE id IN (${ids.join(',')}) RETURNING id`;
      return await executeSql(query);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `${selectedIds.length} evaluation(s) deleted successfully`,
      });
      resetSelection();
      queryClient.invalidateQueries({ queryKey: ['allEvaluations'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete evaluations: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
    }
  });

  // Handle bulk delete
  const handleBulkDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedIds.length > 0) {
      deleteMutation.mutate(selectedIds);
    }
  };

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

        <div className="flex flex-wrap gap-2">
          {/* Result filter dropdown */}
          <Select
            value={filters.result || "all"}
            onValueChange={(value) => {
              setFilters({
                ...filters,
                result: value === "all" ? undefined : value
              });
            }}
          >
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span>{filters.result ? filters.result : "Result"}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="not_ready">Not Ready</SelectItem>
            </SelectContent>
          </Select>
        </div>
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} selected evaluation(s)? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              {deleteMutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EvaluationListTab;
