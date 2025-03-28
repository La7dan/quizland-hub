
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { executeSql } from '@/services/apiService';
import { Evaluation } from '@/services/evaluations/types';
import { useEvaluationFilters } from './hooks/useEvaluationFilters';
import { renderSortIndicator, renderResultBadge } from './utils/evaluationHelpers';

// Import tab components
import PendingEvaluationsTab from './tabs/PendingEvaluationsTab';
import ApprovedEvaluationsTab from './tabs/ApprovedEvaluationsTab';
import DisapprovedEvaluationsTab from './tabs/DisapprovedEvaluationsTab';
import CompletedEvaluationsTab from './tabs/CompletedEvaluationsTab';
import PassedEvaluationsTab from './tabs/PassedEvaluationsTab';

interface EvaluationsCardProps {
  isLoading: boolean;
  error: Error | null;
  evaluations: Evaluation[] | undefined;
  coachId: number;
}

const EvaluationsCard: React.FC<EvaluationsCardProps> = ({ 
  isLoading, error, evaluations, coachId 
}) => {
  const [activeTab, setActiveTab] = useState("pending");
  
  // Fetch all evaluations (including completed ones)
  const { data: allEvaluations, isLoading: allEvaluationsLoading, error: allEvaluationsError } = useQuery({
    queryKey: ['allEvaluations', coachId],
    queryFn: async () => {
      try {
        console.log('Fetching all evaluations for coach:', coachId);
        const query = `
          SELECT e.id, e.status, e.nominated_at, e.evaluation_date, e.evaluation_pdf,
                e.evaluation_result, m.name as member_name, m.member_id as member_code, 
                m.classes_count
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

  // Get evaluations by status and result
  const completedEvaluations = allEvaluations?.filter(e => e.evaluation_pdf) || [];
  const approvedEvaluations = allEvaluations?.filter(e => e.status === 'approved') || [];
  const disapprovedEvaluations = allEvaluations?.filter(e => e.status === 'disapproved') || [];
  
  // Get all evaluations with result (passed and not passed)
  const evaluationsWithResults = allEvaluations?.filter(e => e.evaluation_result) || [];
  
  // Set up filters for completed tab
  const {
    searchTerm,
    setSearchTerm,
    sortField,
    sortOrder,
    filters,
    setFilters,
    toggleSort,
    filteredEvaluations: filteredCompletedEvaluations,
    clearFilters
  } = useEvaluationFilters(completedEvaluations);
  
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

        {evaluationsWithResults && evaluationsWithResults.length > 0 && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-green-800">
              You have <strong>{evaluationsWithResults.length}</strong> evaluations with results. Check the "Results" tab to view passed and not ready evaluations.
            </p>
          </div>
        )}
        
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 flex flex-wrap">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="disapproved">Disapproved</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="passed" className="bg-green-50 data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
              Results {evaluationsWithResults?.length ? `(${evaluationsWithResults.length})` : ''}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <PendingEvaluationsTab 
              isLoading={isLoading}
              error={error}
              evaluations={evaluations}
              hasConnectionError={hasConnectionError}
            />
          </TabsContent>
          
          <TabsContent value="approved">
            <ApprovedEvaluationsTab 
              allEvaluationsLoading={allEvaluationsLoading}
              approvedEvaluations={approvedEvaluations}
            />
          </TabsContent>
          
          <TabsContent value="disapproved">
            <DisapprovedEvaluationsTab 
              allEvaluationsLoading={allEvaluationsLoading}
              disapprovedEvaluations={disapprovedEvaluations}
            />
          </TabsContent>
          
          <TabsContent value="passed">
            <PassedEvaluationsTab 
              allEvaluationsLoading={allEvaluationsLoading}
              passedEvaluations={evaluationsWithResults}
            />
          </TabsContent>
          
          <TabsContent value="completed">
            <CompletedEvaluationsTab 
              allEvaluationsLoading={allEvaluationsLoading}
              completedEvaluations={completedEvaluations}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortField={sortField}
              sortOrder={sortOrder}
              filters={filters}
              setFilters={setFilters}
              toggleSort={toggleSort}
              filteredEvaluations={filteredCompletedEvaluations}
              clearFilters={clearFilters}
              renderResultBadge={renderResultBadge}
              renderSortIndicator={renderSortIndicator}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EvaluationsCard;
