
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { executeSql } from '@/services/apiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileCheck, Download, ChevronLeft, ChevronRight } from 'lucide-react';
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

interface CompletedEvaluationsTabProps {
  refreshTrigger?: number;
}

const ITEMS_PER_PAGE = 10;

const CompletedEvaluationsTab: React.FC<CompletedEvaluationsTabProps> = ({ refreshTrigger }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch only completed evaluations (those with PDF files)
  const { data: completedEvaluations, isLoading } = useQuery({
    queryKey: ['completedEvaluations', searchTerm, refreshTrigger],
    queryFn: async () => {
      let query = `
        SELECT e.id, e.status, e.nominated_at, e.evaluation_date, e.evaluation_pdf,
               e.evaluation_result, e.member_id, e.coach_id,
               m.name as member_name, m.member_id as member_code
        FROM evaluations e
        JOIN members m ON e.member_id = m.id
        WHERE e.evaluation_pdf IS NOT NULL
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

  // Function to export data as CSV
  const exportToCSV = () => {
    if (!completedEvaluations || completedEvaluations.length === 0) return;
    
    const headers = [
      'Member Name', 
      'Member Code', 
      'Status', 
      'Evaluation Date', 
      'Nominated Date',
      'Result'
    ];
    
    const csvData = completedEvaluations.map((item: EvaluationDisplayItem) => [
      item.member_name,
      item.member_code,
      item.status,
      item.evaluation_date ? new Date(item.evaluation_date).toLocaleDateString() : 'Not set',
      new Date(item.nominated_at).toLocaleDateString(),
      item.evaluation_result || 'Not set'
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

  // Pagination logic
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
                setCurrentPage(1); // Reset to first page when searching
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
            <div className="grid grid-cols-5 gap-4 border-b bg-muted/50 p-4 font-medium">
              <div>Member</div>
              <div>Status</div>
              <div>Evaluation Date</div>
              <div>Nominated Date</div>
              <div>Actions</div>
            </div>
            <div className="divide-y">
              {paginatedEvaluations.map((evaluation: EvaluationDisplayItem) => (
                <EvaluationItem key={evaluation.id} evaluation={evaluation} />
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
                      // Show first page, last page, current page, and pages around current
                      return page === 1 || 
                             page === totalPages || 
                             (page >= currentPage - 1 && page <= currentPage + 1);
                    })
                    .map((page, i, array) => {
                      // Add ellipsis
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
              : "Upload evaluation PDFs for members to see completed evaluations here"}
          </p>
        </div>
      )}
    </div>
  );
};

export default CompletedEvaluationsTab;
