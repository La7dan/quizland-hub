
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { format } from 'date-fns';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { fetchPendingEvaluations, approveEvaluation, disapproveEvaluation } from '@/services/dbService';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CoachDashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [disapprovalReason, setDisapprovalReason] = useState('');
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<number | null>(null);

  // Fetch pending evaluations
  const { data, isLoading, error } = useQuery({
    queryKey: ['pendingEvaluations', user?.id],
    queryFn: () => user?.id ? fetchPendingEvaluations(user.id) : Promise.resolve({ success: false, evaluations: [] }),
    enabled: !!user?.id && isAuthenticated && user.role === 'coach'
  });

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

  // If loading auth, show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If not a coach, redirect to home
  if (user?.role !== 'coach') {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navigation />
      <div className="container py-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Coach Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.username}. Review and approve member evaluations.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pending Evaluations</CardTitle>
              <CardDescription>
                Members nominated for evaluation that need your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load evaluations. Please try again later.
                  </AlertDescription>
                </Alert>
              ) : data?.evaluations && data.evaluations.length > 0 ? (
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
                    {data.evaluations.map((evaluation) => (
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
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No pending evaluations found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CoachDashboard;
