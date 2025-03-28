
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Evaluation } from '@/services/evaluations/types';
import { approveEvaluation, disapproveEvaluation } from '@/services/dbService';

interface PendingEvaluationsListProps {
  evaluations: Evaluation[];
}

const PendingEvaluationsList: React.FC<PendingEvaluationsListProps> = ({ evaluations }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [disapprovalReason, setDisapprovalReason] = useState('');
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<number | null>(null);

  // Approve evaluation mutation
  const approveMutation = useMutation({
    mutationFn: (evaluationId: number) => approveEvaluation(evaluationId),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        queryClient.invalidateQueries({ queryKey: ['pendingEvaluations'] });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    }
  });

  // Disapprove evaluation mutation
  const disapproveMutation = useMutation({
    mutationFn: ({ evaluationId, reason }: { evaluationId: number; reason: string }) => 
      disapproveEvaluation(evaluationId, reason),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setDisapprovalReason('');
        queryClient.invalidateQueries({ queryKey: ['pendingEvaluations'] });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    }
  });

  // Handle approve
  const handleApprove = (evaluationId: number) => {
    approveMutation.mutate(evaluationId);
  };

  // Handle disapprove
  const handleDisapprove = () => {
    if (!selectedEvaluationId) return;

    if (!disapprovalReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for disapproval",
        variant: "destructive"
      });
      return;
    }

    disapproveMutation.mutate({ 
      evaluationId: selectedEvaluationId, 
      reason: disapprovalReason 
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Nominated On</TableHead>
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
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleApprove(evaluation.id!)}
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Approve
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => setSelectedEvaluationId(evaluation.id!)}
                    >
                      <XCircle className="h-4 w-4 text-red-500" />
                      Disapprove
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Disapprove Evaluation</DialogTitle>
                      <DialogDescription>
                        Please provide a reason for disapproving this evaluation.
                        This will be recorded in the database.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="reason">Reason for disapproval</Label>
                        <Textarea
                          id="reason"
                          placeholder="Enter your reason"
                          value={disapprovalReason}
                          onChange={(e) => setDisapprovalReason(e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        onClick={handleDisapprove}
                        disabled={disapproveMutation.isPending || !disapprovalReason.trim()}
                        variant="destructive"
                      >
                        {disapproveMutation.isPending ? 'Submitting...' : 'Submit'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PendingEvaluationsList;
