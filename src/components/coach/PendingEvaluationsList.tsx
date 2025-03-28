
import React from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Evaluation } from '@/services/evaluations/types';
import StatusBadge from './StatusBadge';
import EvaluationActions from './EvaluationActions';

interface PendingEvaluationsListProps {
  evaluations: Evaluation[];
  showAll?: boolean;
}

const PendingEvaluationsList: React.FC<PendingEvaluationsListProps> = ({ 
  evaluations, 
  showAll = false 
}) => {
  // Helper function to render evaluation result badge
  const renderResultBadge = (result?: string) => {
    if (!result) return <span className="text-muted-foreground">Not set</span>;
    
    return result === 'passed' ? 
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Passed</Badge> : 
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Not Ready</Badge>;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[120px]">Member ID</TableHead>
            <TableHead className="min-w-[180px]">Name</TableHead>
            <TableHead className="min-w-[150px]">Nominated On</TableHead>
            <TableHead className="min-w-[120px]">Classes Count</TableHead>
            {showAll && (
              <>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Result</TableHead>
              </>
            )}
            <TableHead className="text-right min-w-[180px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {evaluations.map((evaluation) => (
            <TableRow key={evaluation.id}>
              <TableCell className="font-medium">{evaluation.member_code}</TableCell>
              <TableCell>
                <div className="truncate max-w-[180px]">{evaluation.member_name}</div>
              </TableCell>
              <TableCell>
                {evaluation.nominated_at
                  ? format(new Date(evaluation.nominated_at), 'MMM dd, yyyy')
                  : 'N/A'}
              </TableCell>
              <TableCell>{evaluation.classes_count || 0}</TableCell>
              {showAll && (
                <>
                  <TableCell>
                    <StatusBadge status={evaluation.status} />
                  </TableCell>
                  <TableCell>
                    {renderResultBadge(evaluation.evaluation_result)}
                  </TableCell>
                </>
              )}
              <TableCell className="text-right">
                <div className="flex justify-end flex-wrap gap-2">
                  <EvaluationActions 
                    evaluationId={evaluation.id!}
                    pdfFileName={evaluation.evaluation_pdf}
                    status={evaluation.status}
                    showAll={showAll}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PendingEvaluationsList;
