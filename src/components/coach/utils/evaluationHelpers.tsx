
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { SortField } from '../hooks/useEvaluationFilters';

// Helper for rendering sort indicators
export const renderSortIndicator = (
  field: SortField, 
  currentSortField: SortField, 
  currentSortOrder: 'asc' | 'desc'
) => {
  if (field !== currentSortField) return null;
  return currentSortOrder === 'asc' ? 
    <ArrowUp className="inline-block h-4 w-4 ml-1" /> : 
    <ArrowDown className="inline-block h-4 w-4 ml-1" />;
};

// Helper for rendering evaluation result badges
export const renderResultBadge = (result?: string) => {
  if (!result) return <Badge variant="outline">Not Set</Badge>;
  
  return result === 'passed' ? 
    <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">Passed</Badge> : 
    <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Not Ready</Badge>;
};
