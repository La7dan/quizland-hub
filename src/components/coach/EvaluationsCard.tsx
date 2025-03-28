
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PendingEvaluationsList from './PendingEvaluationsList';
import LoadingEvaluations from './LoadingEvaluations';
import EmptyEvaluations from './EmptyEvaluations';
import EvaluationsErrorDisplay from './EvaluationsErrorDisplay';
import { Evaluation } from '@/services/evaluations/types';
import { executeSql } from '@/services/apiService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface EvaluationsCardProps {
  isLoading: boolean;
  error: Error | null;
  evaluations: Evaluation[] | undefined;
  coachId: number;
}

const EvaluationsCard: React.FC<EvaluationsCardProps> = ({ 
  isLoading, error, evaluations, coachId 
}) => {
  // Fetch all evaluations (including completed ones)
  const { data: allEvaluations, isLoading: allEvaluationsLoading, error: allEvaluationsError } = useQuery({
    queryKey: ['allEvaluations', coachId],
    queryFn: async () => {
      try {
        console.log('Fetching all evaluations for coach:', coachId);
        const query = `
          SELECT e.id, e.status, e.nominated_at, e.evaluation_date, e.evaluation_pdf,
                m.name as member_name, m.member_id as member_code
          FROM evaluations e
          JOIN members m ON e.member_id = m.id
          WHERE m.coach_id = ${coachId}
          ORDER BY e.nominated_at DESC
        `;
        
        const result = await executeSql(query);
        console.log('All evaluations fetch result:', result);
        return result.rows || [];
      } catch (err) {
        console.error('Error fetching all evaluations:', err);
        throw err;
      }
    },
    retry: 2
  });

  // Get evaluations by status
  const completedEvaluations = allEvaluations?.filter(e => e.evaluation_pdf) || [];
  const approvedEvaluations = allEvaluations?.filter(e => e.status === 'approved') || [];
  const disapprovedEvaluations = allEvaluations?.filter(e => e.status === 'disapproved') || [];
  
  // Check for database connection errors
  const hasConnectionError = error?.message?.includes('Failed to fetch') || 
                            allEvaluationsError?.message?.includes('Failed to fetch');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Evaluations</CardTitle>
        <CardDescription>
          Review and manage evaluations for members assigned to you
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasConnectionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to connect to the database. Please check your network connection and try again.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="disapproved">Disapproved</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            {isLoading ? (
              <LoadingEvaluations />
            ) : error && !hasConnectionError ? (
              <EvaluationsErrorDisplay />
            ) : evaluations && evaluations.length > 0 ? (
              <PendingEvaluationsList evaluations={evaluations} />
            ) : (
              <EmptyEvaluations />
            )}
          </TabsContent>
          
          <TabsContent value="approved">
            {allEvaluationsLoading ? (
              <LoadingEvaluations />
            ) : approvedEvaluations.length > 0 ? (
              <PendingEvaluationsList evaluations={approvedEvaluations} showAll={true} />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No approved evaluations found.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="disapproved">
            {allEvaluationsLoading ? (
              <LoadingEvaluations />
            ) : disapprovedEvaluations.length > 0 ? (
              <PendingEvaluationsList evaluations={disapprovedEvaluations} showAll={true} />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No disapproved evaluations found.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {allEvaluationsLoading ? (
              <LoadingEvaluations />
            ) : completedEvaluations.length > 0 ? (
              <PendingEvaluationsList evaluations={completedEvaluations} showAll={true} />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No completed evaluations found with PDF files.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all">
            {allEvaluationsLoading ? (
              <LoadingEvaluations />
            ) : allEvaluations && allEvaluations.length > 0 ? (
              <PendingEvaluationsList evaluations={allEvaluations} showAll={true} />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {hasConnectionError 
                    ? "Unable to load evaluations due to connection issues." 
                    : "No evaluations found. Create evaluations for your members to get started."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EvaluationsCard;
