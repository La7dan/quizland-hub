
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { EvaluationDisplayItem } from './types';

interface EvaluationTableRowProps {
  evaluation: EvaluationDisplayItem;
  isAdmin: boolean;
  isSelected: boolean;
  onSelectOne: (id: number, checked: boolean) => void;
  hasLevels: boolean;
  hasCoaches: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
}

const EvaluationTableRow: React.FC<EvaluationTableRowProps> = ({
  evaluation,
  isAdmin,
  isSelected,
  onSelectOne,
  hasLevels,
  hasCoaches,
  onDelete,
  onEdit
}) => {
  // Format the approval status for display
  const getApprovalStatus = () => {
    if (evaluation.evaluation_result) {
      // For passed/not ready evaluations - show Completed in black
      return (
        <Badge variant="outline" className="text-black border-gray-300 bg-gray-100">
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
    <TableRow key={evaluation.id} className={isSelected ? "bg-muted/50" : ""}>
      {isAdmin && (
        <TableCell className="w-[50px]">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={(checked) => 
              onSelectOne(evaluation.id, checked as boolean)
            }
          />
        </TableCell>
      )}
      <TableCell className="min-w-[200px]">
        <div className="font-medium truncate">{evaluation.member_name}</div>
        <div className="text-sm text-muted-foreground truncate">{evaluation.member_code}</div>
      </TableCell>
      {hasLevels && (
        <TableCell className="min-w-[120px]">{evaluation.member_level || 'N/A'}</TableCell>
      )}
      <TableCell className="min-w-[100px]">
        {getApprovalStatus()}
      </TableCell>
      <TableCell className="min-w-[100px]">
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
      <TableCell className="min-w-[120px]">
        {evaluation.nominated_at 
          ? format(new Date(evaluation.nominated_at), 'PP')
          : 'N/A'}
      </TableCell>
      <TableCell className="min-w-[120px]">
        {evaluation.evaluation_date 
          ? format(new Date(evaluation.evaluation_date), 'PP')
          : 'Not set'}
      </TableCell>
      {hasCoaches && (
        <TableCell className="min-w-[150px]">{evaluation.coach_name || 'Not assigned'}</TableCell>
      )}
      <TableCell className="text-right min-w-[150px]">
        {isAdmin ? (
          <div className="flex flex-wrap justify-end items-center gap-2">
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onEdit}
                className="h-8 gap-1"
              >
                <Edit className="h-3 w-3" />
                <span>Edit</span>
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap justify-end items-center gap-2">
            {evaluation.evaluation_pdf && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(evaluation.evaluation_pdf, '_blank')}
                className="h-8 gap-1"
              >
                <span>View PDF</span>
              </Button>
            )}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

export default EvaluationTableRow;
