
import { useState, useMemo } from 'react';
import { EvaluationDisplayItem } from '../types';

export type SortField = 'member_name' | 'status' | 'evaluation_result' | 'nominated_at' | 'evaluation_date' | 'coach_name' | 'member_level';
export type SortOrder = 'asc' | 'desc';

export interface FilterOptions {
  status?: string;
  level?: string;
  coach?: string;
  result?: string;
}

export const useEvaluationFilters = (evaluations: EvaluationDisplayItem[] | undefined, refreshTrigger?: number) => {
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
          (evaluation.member_code && evaluation.member_code.toLowerCase().includes(searchLower)) ||
          (evaluation.coach_name && evaluation.coach_name && evaluation.coach_name.toLowerCase().includes(searchLower));
        
        // Filter functionality
        const matchesStatus = !filters.status || evaluation.status === filters.status;
        const matchesLevel = !filters.level || evaluation.member_level === filters.level;
        const matchesCoach = !filters.coach || 
          (evaluation.coach_id !== undefined && 
           evaluation.coach_id !== null && 
           String(evaluation.coach_id) === filters.coach);
        
        // Result filter (passed or not_ready)
        const matchesResult = !filters.result || evaluation.evaluation_result === filters.result;
        
        return matchesSearch && matchesStatus && matchesLevel && matchesCoach && matchesResult;
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
