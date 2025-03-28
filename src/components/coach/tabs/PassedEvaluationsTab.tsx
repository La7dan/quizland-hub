
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { CheckCircle2, XCircle } from 'lucide-react';
import LoadingEvaluations from '../LoadingEvaluations';
import EvaluationActions from '../EvaluationActions';
import { Evaluation } from '@/services/evaluations/types';

interface PassedEvaluationsTabProps {
  allEvaluationsLoading: boolean;
  passedEvaluations: Evaluation[];
}

const PassedEvaluationsTab: React.FC<PassedEvaluationsTabProps> = ({
  allEvaluationsLoading,
  passedEvaluations,
}) => {
  const [resultFilter, setResultFilter] = useState<'all' | 'passed' | 'not_ready'>('all');
  
  if (allEvaluationsLoading) {
    return <LoadingEvaluations />;
  }
  
  // Separate evaluations by result
  const passed = passedEvaluations.filter(e => e.evaluation_result === 'passed');
  const notReady = passedEvaluations.filter(e => e.evaluation_result === 'not_ready');
  
  // Filtered evaluations based on the selected tab
  const filteredEvaluations = resultFilter === 'all' 
    ? passedEvaluations 
    : resultFilter === 'passed' 
      ? passed 
      : notReady;
  
  // Count of each type
  const passedCount = passed.length;
  const notReadyCount = notReady.length;

  return (
    <div className="space-y-4">
      {passedEvaluations.length > 0 ? (
        <>
          <Tabs defaultValue="all" value={resultFilter} onValueChange={(v) => setResultFilter(v as 'all' | 'passed' | 'not_ready')}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All Results ({passedEvaluations.length})
              </TabsTrigger>
              <TabsTrigger value="passed" className="text-green-700">
                Passed ({passedCount})
              </TabsTrigger>
              <TabsTrigger value="not_ready" className="text-red-700">
                Not Ready ({notReadyCount})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <EvaluationResultsTable evaluations={filteredEvaluations} />
            </TabsContent>
            
            <TabsContent value="passed">
              <EvaluationResultsTable evaluations={filteredEvaluations} />
            </TabsContent>
            
            <TabsContent value="not_ready">
              <EvaluationResultsTable evaluations={filteredEvaluations} />
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No evaluation results found.</p>
        </div>
      )}
    </div>
  );
};

// Helper component for the evaluations table
const EvaluationResultsTable: React.FC<{ evaluations: Evaluation[] }> = ({ evaluations }) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Member ID</TableHead>
              <TableHead className="min-w-[180px]">Name</TableHead>
              <TableHead className="min-w-[150px]">Evaluation Date</TableHead>
              <TableHead className="min-w-[100px]">Result</TableHead>
              <TableHead className="text-right min-w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.map((evaluation) => (
              <TableRow key={evaluation.id}>
                <TableCell className="font-medium">{evaluation.member_code}</TableCell>
                <TableCell>
                  <div className="truncate max-w-[180px]">{evaluation.member_name}</div>
                </TableCell>
                <TableCell>
                  {evaluation.evaluation_date
                    ? format(new Date(evaluation.evaluation_date), 'MMM dd, yyyy')
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  {evaluation.evaluation_result === 'passed' ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Passed</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Not Ready</span>
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <EvaluationActions 
                    evaluationId={evaluation.id!}
                    pdfFileName={evaluation.evaluation_pdf}
                    status={evaluation.status}
                    showAll={true}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PassedEvaluationsTab;
