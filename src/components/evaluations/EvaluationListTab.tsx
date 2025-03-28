
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { executeSql } from '@/services/apiService';
import { Evaluation } from '@/services/evaluations/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import BulkMarkAsPassedButton from './BulkMarkAsPassedButton';
import EvaluationItem from './EvaluationItem';
import { useAuth } from '@/contexts/AuthContext';

const EvaluationListTab: React.FC = () => {
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const { data: evaluations, isLoading } = useQuery({
    queryKey: ['allEvaluations'],
    queryFn: async () => {
      const result = await executeSql(`
        SELECT e.*, m.name as member_name, m.member_id as member_code
        FROM evaluations e
        JOIN members m ON e.member_id = m.id
        ORDER BY e.nominated_at DESC
      `);
      return result.rows || [];
    }
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked && evaluations) {
      setSelectedIds(evaluations.map(eval => eval.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(evalId => evalId !== id));
    }
  };

  const resetSelection = () => {
    setSelectedIds([]);
  };

  if (isLoading) {
    return <div className="py-8 text-center">Loading evaluations...</div>;
  }

  if (!evaluations || evaluations.length === 0) {
    return <div className="py-8 text-center">No evaluations found.</div>;
  }

  return (
    <div>
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <BulkMarkAsPassedButton 
            selectedIds={selectedIds} 
            onReset={resetSelection} 
          />
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && (
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedIds.length === evaluations.length && evaluations.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead>Member</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Nominated</TableHead>
              <TableHead>Evaluation Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.map((evaluation: Evaluation) => (
              <TableRow key={evaluation.id}>
                {isAdmin && (
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.includes(evaluation.id!)}
                      onCheckedChange={(checked) => 
                        handleSelectOne(evaluation.id!, checked as boolean)
                      }
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div className="font-medium">{evaluation.member_name}</div>
                  <div className="text-sm text-muted-foreground">{evaluation.member_code}</div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      evaluation.status === 'approved' ? 'success' :
                      evaluation.status === 'disapproved' ? 'destructive' : 'default'
                    }
                  >
                    {evaluation.status}
                  </Badge>
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
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <EvaluationItem evaluation={{
                      id: evaluation.id!,
                      status: evaluation.status,
                      nominated_at: evaluation.nominated_at,
                      member_name: evaluation.member_name!,
                      member_code: evaluation.member_code!,
                      evaluation_date: evaluation.evaluation_date,
                      evaluation_pdf: evaluation.evaluation_pdf,
                      evaluation_result: evaluation.evaluation_result,
                      member_id: evaluation.member_id,
                      coach_id: evaluation.coach_id
                    }} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EvaluationListTab;
