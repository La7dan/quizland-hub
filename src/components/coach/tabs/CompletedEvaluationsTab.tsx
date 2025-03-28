
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Search, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { SortField } from '../hooks/useEvaluationFilters';
import LoadingEvaluations from '../LoadingEvaluations';
import EvaluationActions from '../EvaluationActions';
import { Evaluation } from '@/services/evaluations/types';

interface CompletedEvaluationsTabProps {
  allEvaluationsLoading: boolean;
  completedEvaluations: Evaluation[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortField: SortField;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, string | undefined>;
  setFilters: (filters: Record<string, string | undefined>) => void;
  toggleSort: (field: SortField) => void;
  filteredEvaluations: Evaluation[];
  clearFilters: () => void;
  renderResultBadge: (result?: string) => React.ReactNode;
  renderSortIndicator: (field: SortField, currentSortField: SortField, currentSortOrder: 'asc' | 'desc') => React.ReactNode;
}

const CompletedEvaluationsTab: React.FC<CompletedEvaluationsTabProps> = ({
  allEvaluationsLoading,
  completedEvaluations,
  searchTerm,
  setSearchTerm,
  sortField,
  sortOrder,
  filters,
  setFilters,
  toggleSort,
  filteredEvaluations,
  clearFilters,
  renderResultBadge,
  renderSortIndicator,
}) => {
  if (allEvaluationsLoading) {
    return <LoadingEvaluations />;
  }

  return (
    <>
      {/* Filters for completed evaluations */}
      {completedEvaluations.length > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={filters.result || 'all'}
              onValueChange={(value) => setFilters({ ...filters, result: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <span>{filters.result ? `Result: ${filters.result}` : 'Filter Result'}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="not_ready">Not Ready</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              disabled={!searchTerm && Object.keys(filters).length === 0}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}
      
      {filteredEvaluations.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => toggleSort('member_code')}
                  >
                    Member ID {renderSortIndicator('member_code', sortField, sortOrder)}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => toggleSort('member_name')}
                  >
                    Name {renderSortIndicator('member_name', sortField, sortOrder)}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => toggleSort('evaluation_date')}
                  >
                    Eval Date {renderSortIndicator('evaluation_date', sortField, sortOrder)}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => toggleSort('evaluation_result')}
                  >
                    Result {renderSortIndicator('evaluation_result', sortField, sortOrder)}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvaluations.map((evaluation) => (
                  <TableRow key={evaluation.id}>
                    <TableCell className="font-medium">{evaluation.member_code}</TableCell>
                    <TableCell>
                      <div className="truncate max-w-[180px]">{evaluation.member_name}</div>
                    </TableCell>
                    <TableCell>
                      {evaluation.evaluation_date
                        ? format(new Date(evaluation.evaluation_date), 'MMM dd, yyyy')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {renderResultBadge(evaluation.evaluation_result)}
                    </TableCell>
                    <TableCell className="text-right">
                      <EvaluationActions 
                        evaluationId={evaluation.id!}
                        pdfFileName={evaluation.evaluation_pdf}
                        status={evaluation.status}
                        showAll={true}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {completedEvaluations.length > 0 
              ? "No evaluations match your search criteria." 
              : "No completed evaluations found with PDF files."}
          </p>
        </div>
      )}
    </>
  );
};

export default CompletedEvaluationsTab;
