
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Nominated On</TableHead>
          <TableHead>Classes Count</TableHead>
          {showAll && <TableHead>Status</TableHead>}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {evaluations.map((evaluation) => (
          <TableRow key={evaluation.id}>
            <TableCell className="font-medium">{evaluation.member_code}</TableCell>
            <TableCell>{evaluation.member_name}</TableCell>
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
  );
};

export default PendingEvaluationsList;
