
import React, { useState } from 'react';
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
  const { data: allEvaluations, isLoading: allEvaluationsLoading } = useQuery({
    queryKey: ['allEvaluations', coachId],
    queryFn: async () => {
      const query = `
        SELECT e.id, e.status, e.nominated_at, e.evaluation_date, e.evaluation_pdf,
               m.name as member_name, m.member_id as member_code
        FROM evaluations e
        JOIN members m ON e.member_id = m.id
        WHERE m.coach_id = ${coachId}
        ORDER BY e.nominated_at DESC
      `;
      
      const result = await executeSql(query);
      return result.rows || [];
    }
  });

  // Get completed evaluations (those with PDF files)
  const completedEvaluations = allEvaluations?.filter(e => e.evaluation_pdf) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Evaluations</CardTitle>
        <CardDescription>
          Review and manage evaluations for members assigned to you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
            <TabsTrigger value="completed">Completed Evaluations</TabsTrigger>
            <TabsTrigger value="all">All Evaluations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            {isLoading ? (
              <LoadingEvaluations />
            ) : error ? (
              <EvaluationsErrorDisplay />
            ) : evaluations && evaluations.length > 0 ? (
              <PendingEvaluationsList evaluations={evaluations} />
            ) : (
              <EmptyEvaluations />
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
                <p className="text-muted-foreground">No evaluations found.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EvaluationsCard;
