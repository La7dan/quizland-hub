
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
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Search, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import PendingEvaluationsList from './PendingEvaluationsList';
import LoadingEvaluations from './LoadingEvaluations';
import EmptyEvaluations from './EmptyEvaluations';
import EvaluationsErrorDisplay from './EvaluationsErrorDisplay';
import EvaluationActions from './EvaluationActions';
import { Evaluation } from '@/services/evaluations/types';
import { executeSql } from '@/services/apiService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useEvaluationFilters, SortField } from './hooks/useEvaluationFilters';

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

  // Get evaluations by status
  const completedEvaluations = allEvaluations?.filter(e => e.evaluation_pdf) || [];
  const approvedEvaluations = allEvaluations?.filter(e => e.status === 'approved') || [];
  const disapprovedEvaluations = allEvaluations?.filter(e => e.status === 'disapproved') || [];
  
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

  // Helper for rendering sort indicators
  const renderSortIndicator = (field: SortField) => {
    if (field !== sortField) return null;
    return sortOrder === 'asc' ? 
      <ArrowUp className="inline-block h-4 w-4 ml-1" /> : 
      <ArrowDown className="inline-block h-4 w-4 ml-1" />;
  };

  // Helper for rendering evaluation result badges
  const renderResultBadge = (result?: string) => {
    if (!result) return <Badge variant="outline">Not Set</Badge>;
    
    return result === 'passed' ? 
      <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">Passed</Badge> : 
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Not Ready</Badge>;
  };

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
        
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            ) : (
              <>
                {/* Filters for completed evaluations */}
                {completedEvaluations.length > 0 && (
                  <div className="mb-4 flex flex-col sm:flex-row gap-3 justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search members..."
                          className="pl-8 w-[250px]"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Select
                        value={filters.result || 'all'}
                        onValueChange={(value) => setFilters({ ...filters, result: value === 'all' ? undefined : value })}
                      >
                        <SelectTrigger className="w-[140px]">
                          <Filter className="h-4 w-4 mr-2" />
                          <span>{filters.result ? `Result: ${filters.result}` : 'Filter Result'}</span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Results</SelectItem>
                          <SelectItem value="passed">Passed</SelectItem>
                          <SelectItem value="not_ready">Not Ready</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={clearFilters}
                        disabled={!searchTerm && Object.keys(filters).length === 0}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                )}
                
                {filteredCompletedEvaluations.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead 
                              className="cursor-pointer" 
                              onClick={() => toggleSort('member_code')}
                            >
                              Member ID {renderSortIndicator('member_code')}
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer" 
                              onClick={() => toggleSort('member_name')}
                            >
                              Name {renderSortIndicator('member_name')}
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer" 
                              onClick={() => toggleSort('evaluation_date')}
                            >
                              Eval Date {renderSortIndicator('evaluation_date')}
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer" 
                              onClick={() => toggleSort('evaluation_result')}
                            >
                              Result {renderSortIndicator('evaluation_result')}
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCompletedEvaluations.map((evaluation) => (
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
                                {renderResultBadge(evaluation.evaluation_result)}
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
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {completedEvaluations.length > 0 
                        ? "No evaluations match your search criteria." 
                        : "No completed evaluations found with PDF files."}
                    </p>
                  </div>
                )}
              </>
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
