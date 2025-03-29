
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Trash } from 'lucide-react';
import { FilterOptions } from './hooks/useEvaluationFilters';

interface EvaluationFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  filterOptions: {
    statuses: string[];
    levels: string[];
    coaches: { id: number; username: string }[];
    results?: string[];
  } | undefined;
  onClearFilters: () => void;
  onExportCSV: () => void;
  exportDisabled: boolean;
  selectedIds: number[];
  onDeleteSelected?: () => void;
}

const EvaluationFilters: React.FC<EvaluationFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  filterOptions,
  onClearFilters,
  onExportCSV,
  exportDisabled,
  selectedIds,
  onDeleteSelected
}) => {
  return (
    <div className="flex flex-col space-y-4 mb-6">
      {/* Search and filters row */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        {/* Search box */}
        <div className="flex items-center max-w-[250px]">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center">
            <Select 
              value={filters.status || 'all'} 
              onValueChange={(value) => setFilters({...filters, status: value === 'all' ? undefined : value})}
            >
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <span>Status</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {filterOptions?.statuses.map((status: string) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center">
            <Select 
              value={filters.level || 'all'} 
              onValueChange={(value) => setFilters({...filters, level: value === 'all' ? undefined : value})}
            >
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <span>Level</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {filterOptions?.levels.map((level: string) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center">
            <Select 
              value={filters.coach || 'all'} 
              onValueChange={(value) => setFilters({...filters, coach: value === 'all' ? undefined : value})}
            >
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <span>Coach</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coaches</SelectItem>
                {filterOptions?.coaches.map((coach) => (
                  <SelectItem key={coach.id} value={coach.id.toString()}>
                    {coach.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Result filter */}
          <div className="flex items-center">
            <Select 
              value={filters.result || 'all'} 
              onValueChange={(value) => setFilters({...filters, result: value === 'all' ? undefined : value})}
            >
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <span>Result</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="not_ready">Not Ready</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearFilters}
            disabled={Object.keys(filters).length === 0}
          >
            Clear Filters
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExportCSV}
            disabled={exportDisabled}
          >
            Export CSV
          </Button>
        </div>
      </div>
      
      {/* Delete selected row - only shown when items are selected */}
      {selectedIds.length > 0 && onDeleteSelected && (
        <div className="flex justify-end">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onDeleteSelected}
            className="flex items-center gap-1"
          >
            <Trash className="h-4 w-4" />
            Delete Selected ({selectedIds.length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default EvaluationFilters;
