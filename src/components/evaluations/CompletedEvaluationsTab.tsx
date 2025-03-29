
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { executeSql } from '@/services/apiService';
import { EvaluationDisplayItem } from './types';
import LoadingEvaluationState from './LoadingEvaluationState';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ENV } from '@/config/env';

// Import newly created components
import SearchExportBar from './components/SearchExportBar';
import EvaluationsTable from './components/EvaluationsTable';
import NoEvaluationsFound from './components/NoEvaluationsFound';
import PaginationControls from './components/PaginationControls';
import { useEvaluationExport } from './hooks/useEvaluationExport';

interface CompletedEvaluationsTabProps {
  refreshTrigger?: number;
}

const ITEMS_PER_PAGE = 10;

const CompletedEvaluationsTab: React.FC<CompletedEvaluationsTabProps> = ({ refreshTrigger }) => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteEvaluationId, setDeleteEvaluationId] = useState<number | null>(null);
  const { exportToCSV } = useEvaluationExport();

  // Fetch completed evaluations
  const { data: completedEvaluations, isLoading, refetch } = useQuery({
    queryKey: ['completedEvaluations', searchTerm, refreshTrigger],
    queryFn: async () => {
      let query = `
        SELECT e.id, e.status, e.nominated_at, e.evaluation_date, e.evaluation_pdf,
               e.evaluation_result, e.member_id, e.coach_id,
               m.name as member_name, m.member_id as member_code
        FROM evaluations e
        JOIN members m ON e.member_id = m.id
        WHERE e.status = 'completed' OR e.evaluation_result IS NOT NULL
      `;
      
      if (searchTerm) {
        query += ` AND (m.name ILIKE '%${searchTerm}%' OR m.member_id ILIKE '%${searchTerm}%')`;
      }
      
      query += ` ORDER BY e.evaluation_date DESC NULLS LAST`;
      
      console.log("Executing completed evaluations query:", query);
      const result = await executeSql(query);
      console.log("Completed evaluations result:", result);
      return result.rows || [];
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const query = `DELETE FROM evaluations WHERE id = ${id} RETURNING id`;
      return await executeSql(query);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Evaluation deleted successfully",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete evaluation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Handle delete
  const handleDelete = (id: number) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admins can delete evaluations",
        variant: "destructive"
      });
      return;
    }
    
    deleteMutation.mutate(id);
  };

  // Pagination
  const totalItems = completedEvaluations?.length || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEvaluations = completedEvaluations?.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle export
  const handleExport = () => {
    exportToCSV(completedEvaluations || []);
  };

  return (
    <div>
      <SearchExportBar 
        searchTerm={searchTerm} 
        setSearchTerm={(term) => {
          setSearchTerm(term);
          setCurrentPage(1);
        }}
        onExport={handleExport}
        hasData={Boolean(completedEvaluations?.length)}
      />
      
      {isLoading ? (
        <LoadingEvaluationState />
      ) : completedEvaluations && completedEvaluations.length > 0 ? (
        <>
          <EvaluationsTable 
            evaluations={paginatedEvaluations} 
            onDelete={isAdmin ? handleDelete : undefined}
            isDeleting={deleteMutation.isPending}
          />
          
          <PaginationControls 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <NoEvaluationsFound searchTerm={searchTerm} />
      )}
    </div>
  );
};

export default CompletedEvaluationsTab;
