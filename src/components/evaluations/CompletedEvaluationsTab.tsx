import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { executeSql } from '@/services/apiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileCheck, Download, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { EvaluationDisplayItem } from './types';
import EvaluationItem from './EvaluationItem';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import LoadingEvaluationState from './LoadingEvaluationState';
import { useToast } from '@/components/ui/use-toast';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ENV } from '@/config/env';

interface CompletedEvaluationsTabProps {
  refreshTrigger?: number;
}

const ITEMS_PER_PAGE = 10;

const CompletedEvaluationsTab: React.FC<CompletedEvaluationsTabProps> = ({ refreshTrigger }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteEvaluationId, setDeleteEvaluationId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: completedEvaluations, isLoading, refetch } = useQuery({
    queryKey: ['completedEvaluations', searchTerm, refreshTrigger],
    queryFn: async () => {
      let query = `
        SELECT e.id, e.status, e.nominated_at, e.evaluation_date, e.evaluation_pdf,
               e.evaluation_result, e.member_id, e.coach_id,
               m.name as member_name, m.member_id as member_code
        FROM evaluations e
        JOIN members m ON e.member_id = m.id
        WHERE e.status = 'completed' OR e.evaluation_result = 'passed'
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
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete evaluation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  const handleDelete = (id: number) => {
    setDeleteEvaluationId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (deleteEvaluationId) {
      deleteMutation.mutate(deleteEvaluationId);
    }
  };

  const exportToCSV = () => {
    if (!completedEvaluations || completedEvaluations.length === 0) return;
    
    const headers = [
      'Member Name', 
      'Member Code', 
      'Status', 
      'Evaluation Date', 
      'Nominated Date',
      'Result',
      'Has PDF'
    ];
    
    const csvData = completedEvaluations.map((item: EvaluationDisplayItem) => [
      item.member_name,
      item.member_code,
      item.status,
      item.evaluation_date ? new Date(item.evaluation_date).toLocaleDateString() : 'Not set',
      new Date(item.nominated_at).toLocaleDateString(),
      item.evaluation_result || 'Not set',
      item.evaluation_pdf ? 'Yes' : 'No'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `completed_evaluations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalItems = completedEvaluations?.length || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEvaluations = completedEvaluations?.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 pb-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 w-full sm:w-[250px]"
            />
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={exportToCSV}
          disabled={!completedEvaluations || completedEvaluations.length === 0}
          className="w-full sm:w-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      
      {isLoading ? (
        <LoadingEvaluationState />
      ) : completedEvaluations && completedEvaluations.length > 0 ? (
        <>
          <div className="border rounded-md">
            <div className="grid grid-cols-6 gap-4 border-b bg-muted/50 p-4 font-medium">
              <div>Member</div>
              <div>Status</div>
              <div>Evaluation Date</div>
              <div>Nominated Date</div>
              <div>Result</div>
              <div className="text-right">Actions</div>
            </div>
            <div className="divide-y">
              {paginatedEvaluations.map((evaluation: EvaluationDisplayItem) => (
                <div key={evaluation.id} className="grid grid-cols-6 gap-4 p-4 items-center">
                  <div>
                    <div className="font-medium">{evaluation.member_name}</div>
                    <div className="text-sm text-muted-foreground">{evaluation.member_code}</div>
                  </div>
                  <div>{evaluation.status}</div>
                  <div>
                    {evaluation.evaluation_date 
                      ? new Date(evaluation.evaluation_date).toLocaleDateString() 
                      : 'Not set'}
                  </div>
                  <div>{new Date(evaluation.nominated_at).toLocaleDateString()}</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      evaluation.evaluation_result === 'passed' 
                        ? 'bg-green-100 text-green-800' 
                        : evaluation.evaluation_result === 'not_ready'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {evaluation.evaluation_result || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-end items-center space-x-2">
                    {evaluation.evaluation_pdf && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => {
                          const API_BASE_URL = ENV.API_BASE_URL?.replace('/api', '') || '';
                          const fileUrl = evaluation.evaluation_pdf?.startsWith('http') 
                            ? evaluation.evaluation_pdf 
                            : `${API_BASE_URL}/files/${evaluation.evaluation_pdf}`;
                          window.open(fileUrl, '_blank');
                        }}
                      >
                        <FileCheck className="h-4 w-4 text-blue-500" />
                        PDF
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(evaluation.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 || 
                             page === totalPages || 
                             (page >= currentPage - 1 && page <= currentPage + 1);
                    })
                    .map((page, i, array) => {
                      const showEllipsisBefore = i > 0 && array[i-1] !== page - 1;
                      const showEllipsisAfter = i < array.length - 1 && array[i+1] !== page + 1;
                      
                      return (
                        <React.Fragment key={page}>
                          {showEllipsisBefore && (
                            <PaginationItem>
                              <span className="flex h-9 w-9 items-center justify-center">...</span>
                            </PaginationItem>
                          )}
                          
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={page === currentPage}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                          
                          {showEllipsisAfter && (
                            <PaginationItem>
                              <span className="flex h-9 w-9 items-center justify-center">...</span>
                            </PaginationItem>
                          )}
                        </React.Fragment>
                      );
                    })
                  }
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg border-muted">
          <FileCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-2 text-lg font-semibold">No completed evaluations found</h3>
          <p className="text-muted-foreground mt-1">
            {searchTerm
              ? "Try changing your search"
              : "Mark evaluations as 'completed' or 'passed' to see them here"}
          </p>
        </div>
      )}
      
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Evaluation"
        description="Are you sure you want to delete this evaluation? This action cannot be undone."
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default CompletedEvaluationsTab;
