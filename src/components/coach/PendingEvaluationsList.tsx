
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
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[120px]">Member ID</TableHead>
            <TableHead className="min-w-[180px]">Name</TableHead>
            <TableHead className="min-w-[150px]">Nominated On</TableHead>
            <TableHead className="min-w-[120px]">Classes Count</TableHead>
            {showAll && <TableHead className="min-w-[100px]">Status</TableHead>}
            <TableHead className="text-right min-w-[100px]">Actions</TableHead>
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
                <TableCell>
                  <StatusBadge status={evaluation.status} />
                </TableCell>
              )}
              <TableCell className="text-right">
                <EvaluationActions 
                  evaluationId={evaluation.id!}
                  pdfFileName={evaluation.evaluation_pdf}
                  status={evaluation.status}
                  showAll={showAll}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PendingEvaluationsList;
