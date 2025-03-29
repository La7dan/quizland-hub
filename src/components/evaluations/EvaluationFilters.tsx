
import { useState } from 'react';
import { ArrowDown, ArrowUp, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface FilterOptions {
  statuses: string[];
  levels: string[];
  results: string[];
}

interface Filters {
  status: string;
  level: string;
  result: string;
}

interface EvaluationFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  toggleSort: (field: string) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  clearFilters: () => void;
  filterOptions: FilterOptions;
}

export function EvaluationFilters({
  searchTerm,
  setSearchTerm,
  sortField,
  sortOrder,
  toggleSort,
  filters,
  setFilters,
  clearFilters,
  filterOptions
}: EvaluationFiltersProps) {
  const [hasFilters, setHasFilters] = useState(false);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters({ ...filters, [key]: value });
    
    // Check if there are active filters
    const newFilters = { ...filters, [key]: value };
    const activeFilters = Object.values(newFilters).some(filter => filter !== 'all');
    setHasFilters(activeFilters);
  };

  const handleClearFilters = () => {
    clearFilters();
    setHasFilters(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search evaluations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              className="absolute right-0 top-0 h-9 w-9 p-0"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
            onClick={() => toggleSort('nominated_at')}
          >
            {sortField === 'nominated_at' ? (
              <>
                Date {sortOrder === 'asc' ? <ArrowUp className="ml-1 h-3.5 w-3.5" /> : <ArrowDown className="ml-1 h-3.5 w-3.5" />}
              </>
            ) : (
              'Sort by Date'
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort('status')}
          >
            {sortField === 'status' ? (
              <>
                Status {sortOrder === 'asc' ? <ArrowUp className="ml-1 h-3.5 w-3.5" /> : <ArrowDown className="ml-1 h-3.5 w-3.5" />}
              </>
            ) : (
              'Sort by Status'
            )}
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <div className="w-full sm:w-auto">
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {(filterOptions?.statuses || []).map((status: string) => (
                <SelectItem key={status || 'unknown'} value={status || 'unknown'}>
                  {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto">
          <Select
            value={filters.level}
            onValueChange={(value) => handleFilterChange('level', value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {(filterOptions?.levels || []).map((level: string) => (
                <SelectItem key={level || 'unknown'} value={level || 'unknown'}>
                  {level || 'Unknown'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto">
          <Select
            value={filters.result}
            onValueChange={(value) => handleFilterChange('result', value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              {(filterOptions?.results || []).map((result: string) => (
                <SelectItem key={result || 'unknown'} value={result || 'unknown'}>
                  {result ? result.charAt(0).toUpperCase() + result.slice(1) : 'Unknown'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {hasFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilters}
            className="ml-auto"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Clear Filters
          </Button>
        )}
      </div>
      
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleFilterChange('status', 'all')}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          )}
          
          {filters.level !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Level: {filters.level}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleFilterChange('level', 'all')}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          )}
          
          {filters.result !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Result: {filters.result}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleFilterChange('result', 'all')}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
