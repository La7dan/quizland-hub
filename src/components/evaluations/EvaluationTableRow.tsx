
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { EvaluationDisplayItem } from './types';
import EvaluationItem from './EvaluationItem';

interface EvaluationTableRowProps {
  evaluation: EvaluationDisplayItem;
  isAdmin: boolean;
  isSelected: boolean;
  onSelectOne: (id: number, checked: boolean) => void;
  hasLevels: boolean;
  hasCoaches: boolean;
}

const EvaluationTableRow: React.FC<EvaluationTableRowProps> = ({
  evaluation,
  isAdmin,
  isSelected,
  onSelectOne,
  hasLevels,
  hasCoaches
}) => {
  // Format the approval status for display
  const getApprovalStatus = () => {
    if (evaluation.evaluation_pdf) {
      return (
        <Badge variant="success">
          Completed
        </Badge>
      );
    }
    
    return (
      <Badge 
        variant={
          evaluation.status === 'approved' ? 'success' :
          evaluation.status === 'disapproved' ? 'destructive' : 'default'
        }
      >
        {evaluation.status}
      </Badge>
    );
  };

  return (
    <TableRow key={evaluation.id}>
      {isAdmin && (
        <TableCell>
          <Checkbox 
            checked={isSelected}
            onCheckedChange={(checked) => 
              onSelectOne(evaluation.id, checked as boolean)
            }
          />
        </TableCell>
      )}
      <TableCell>
        <div className="font-medium">{evaluation.member_name}</div>
        <div className="text-sm text-muted-foreground">{evaluation.member_code}</div>
      </TableCell>
      {hasLevels && (
        <TableCell>{evaluation.member_level || 'N/A'}</TableCell>
      )}
      <TableCell>
        {getApprovalStatus()}
      </TableCell>
      <TableCell>
        {evaluation.evaluation_result ? (
          <Badge 
            variant={evaluation.evaluation_result === 'passed' ? 'success' : 'destructive'}
          >
            {evaluation.evaluation_result}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        {evaluation.nominated_at 
          ? format(new Date(evaluation.nominated_at), 'PP')
          : 'N/A'}
      </TableCell>
      <TableCell>
        {evaluation.evaluation_date 
          ? format(new Date(evaluation.evaluation_date), 'PP')
          : 'Not set'}
      </TableCell>
      {hasCoaches && (
        <TableCell>{evaluation.coach_name || 'Not assigned'}</TableCell>
      )}
      <TableCell className="text-right">
        <div className="flex justify-end">
          <EvaluationItem evaluation={evaluation} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EvaluationTableRow;
