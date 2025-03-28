
import { useState, useMemo } from 'react';
import { Evaluation } from '@/services/evaluations/types';

export type SortField = 'member_name' | 'member_code' | 'status' | 'nominated_at' | 'evaluation_date' | 'evaluation_result';
export type SortOrder = 'asc' | 'desc';
export type FilterOptions = {
  status?: string;
  result?: string;
};

export const useEvaluationFilters = (evaluations: Evaluation[] | undefined) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('nominated_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filters, setFilters] = useState<FilterOptions>({});

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  // Apply search, filtering and sorting
  const filteredEvaluations = useMemo(() => {
    if (!evaluations) return [];
    
    return evaluations
      .filter((evaluation) => {
        // Search functionality
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || 
          (evaluation.member_name && evaluation.member_name.toLowerCase().includes(searchLower)) ||
          (evaluation.member_code && evaluation.member_code.toLowerCase().includes(searchLower));
        
        // Filter functionality
        const matchesStatus = !filters.status || evaluation.status === filters.status;
        const matchesResult = !filters.result || evaluation.evaluation_result === filters.result;
        
        return matchesSearch && matchesStatus && matchesResult;
      })
      .sort((a, b) => {
        // Apply sorting
        let valA: any = a[sortField];
        let valB: any = b[sortField];
        
        // Handle dates
        if (sortField === 'nominated_at' || sortField === 'evaluation_date') {
          valA = valA ? new Date(valA).getTime() : 0;
          valB = valB ? new Date(valB).getTime() : 0;
        } 
        // Handle strings
        else if (typeof valA === 'string' && typeof valB === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        
        // Handle null/undefined values
        if (valA === null || valA === undefined) return sortOrder === 'asc' ? -1 : 1;
        if (valB === null || valB === undefined) return sortOrder === 'asc' ? 1 : -1;
        
        return sortOrder === 'asc' 
          ? (valA > valB ? 1 : -1) 
          : (valA < valB ? 1 : -1);
      });
  }, [evaluations, searchTerm, sortField, sortOrder, filters]);

  return {
    searchTerm,
    setSearchTerm,
    sortField,
    sortOrder,
    filters,
    setFilters,
    toggleSort,
    filteredEvaluations,
    clearFilters
  };
};
