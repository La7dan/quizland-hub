
import { useState, useMemo } from 'react';
import { EvaluationDisplayItem } from '../types';

export type SortField = 'nominated_at' | 'evaluation_date' | 'member_name' | 'status' | 'coach_name' | 'evaluation_result';
export type SortOrder = 'asc' | 'desc';

// Add the FilterOptions type
export interface FilterOptions {
  status?: string;
  level?: string;
  coach?: string;
  result?: string;
}

export const useEvaluationFilters = (evaluations: EvaluationDisplayItem[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('nominated_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filters, setFilters] = useState<FilterOptions>({});

  // Filter evaluations based on search term and filters
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(evaluation => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const memberNameMatch = evaluation.member_name?.toLowerCase().includes(searchLower);
        const memberCodeMatch = evaluation.member_code?.toLowerCase().includes(searchLower);
        
        if (!memberNameMatch && !memberCodeMatch) {
          return false;
        }
      }
      
      // Status filter
      if (filters.status && evaluation.status !== filters.status) {
        return false;
      }
      
      // Level filter (using the correct column member_level)
      if (filters.level && evaluation.member_level !== filters.level) {
        return false;
      }
      
      // Coach filter
      if (filters.coach && evaluation.coach_name !== filters.coach) {
        return false;
      }
      
      // Result filter
      if (filters.result && evaluation.evaluation_result !== filters.result) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Handle sorting
      let valueA: any = a[sortField];
      let valueB: any = b[sortField];
      
      // Convert dates to timestamps for comparison
      if (sortField === 'nominated_at' || sortField === 'evaluation_date') {
        valueA = valueA ? new Date(valueA).getTime() : 0;
        valueB = valueB ? new Date(valueB).getTime() : 0;
      }
      
      // Handle string comparison
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        if (sortOrder === 'asc') {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      }
      
      // Handle numeric comparison
      if (sortOrder === 'asc') {
        return (valueA || 0) - (valueB || 0);
      } else {
        return (valueB || 0) - (valueA || 0);
      }
    });
  }, [evaluations, searchTerm, filters, sortField, sortOrder]);

  // Toggle sort field and order
  const toggleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({});
    setSortField('nominated_at');
    setSortOrder('desc');
  };

  return {
    searchTerm,
    setSearchTerm,
    sortField,
    sortOrder,
    filters,
    setFilters,
    filteredEvaluations,
    toggleSort,
    clearFilters
  };
};
