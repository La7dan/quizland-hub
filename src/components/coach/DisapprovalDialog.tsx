
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
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
import { XCircle } from 'lucide-react';
import { disapproveEvaluation } from '@/services/evaluations/evaluationService';

interface DisapprovalDialogProps {
  evaluationId: number;
  showStatus?: boolean;
}

const DisapprovalDialog: React.FC<DisapprovalDialogProps> = ({ 
  evaluationId,
  showStatus = false
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [disapprovalReason, setDisapprovalReason] = React.useState('');

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
        queryClient.invalidateQueries({ queryKey: ['allEvaluations'] });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    }
  });

  // Handle disapprove
  const handleDisapprove = () => {
    if (!disapprovalReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for disapproval",
        variant: "destructive"
      });
      return;
    }

    disapproveMutation.mutate({ 
      evaluationId, 
      reason: disapprovalReason 
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <XCircle className="h-4 w-4 text-red-500" />
          {showStatus ? 'Disapproved' : 'Disapprove'}
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
  );
};

export default DisapprovalDialog;
