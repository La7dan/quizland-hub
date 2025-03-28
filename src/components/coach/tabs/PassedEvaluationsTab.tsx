
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Search, ArrowUp, ArrowDown } from 'lucide-react';
import { SortField } from '../hooks/useEvaluationFilters';
import LoadingEvaluations from '../LoadingEvaluations';
import EvaluationActions from '../EvaluationActions';
import { Evaluation } from '@/services/evaluations/types';

interface PassedEvaluationsTabProps {
  allEvaluationsLoading: boolean;
  passedEvaluations: Evaluation[];
  passedSearchTerm: string;
  setPassedSearchTerm: (term: string) => void;
  passedSortField: SortField;
  passedSortOrder: 'asc' | 'desc';
  passedFilters: Record<string, string | undefined>;
  togglePassedSort: (field: SortField) => void;
  filteredPassedEvaluations: Evaluation[];
  clearPassedFilters: () => void;
  renderResultBadge: (result?: string) => React.ReactNode;
  renderSortIndicator: (field: SortField, currentSortField: SortField, currentSortOrder: 'asc' | 'desc') => React.ReactNode;
}

const PassedEvaluationsTab: React.FC<PassedEvaluationsTabProps> = ({
  allEvaluationsLoading,
  passedEvaluations,
  passedSearchTerm,
  setPassedSearchTerm,
  passedSortField,
  passedSortOrder,
  passedFilters,
  togglePassedSort,
  filteredPassedEvaluations,
  clearPassedFilters,
  renderResultBadge,
  renderSortIndicator,
}) => {
  if (allEvaluationsLoading) {
    return <LoadingEvaluations />;
  }

  return (
    <>
      {/* Filters for passed evaluations */}
      {passedEvaluations.length > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                className="pl-8 w-[250px]"
                value={passedSearchTerm}
                onChange={(e) => setPassedSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearPassedFilters}
              disabled={!passedSearchTerm && Object.keys(passedFilters).length === 0}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}
      
      {passedEvaluations.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => togglePassedSort('member_code')}
                  >
                    Member ID {renderSortIndicator('member_code', passedSortField, passedSortOrder)}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => togglePassedSort('member_name')}
                  >
                    Name {renderSortIndicator('member_name', passedSortField, passedSortOrder)}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => togglePassedSort('evaluation_date')}
                  >
                    Eval Date {renderSortIndicator('evaluation_date', passedSortField, passedSortOrder)}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => togglePassedSort('status')}
                  >
                    Status {renderSortIndicator('status', passedSortField, passedSortOrder)}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPassedEvaluations.map((evaluation) => (
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
            No passed evaluations found.
          </p>
        </div>
      )}
    </>
  );
};

export default PassedEvaluationsTab;
