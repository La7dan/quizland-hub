
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { executeSql } from '@/services/apiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EvaluationDisplayItem } from './types';
import EvaluationItem from './EvaluationItem';

interface EvaluationListTabProps {
  refreshTrigger: number;
}

const EvaluationListTab: React.FC<EvaluationListTabProps> = ({ refreshTrigger }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch evaluations
  const { data: evaluationsData, isLoading } = useQuery({
    queryKey: ['evaluations', searchTerm, statusFilter, refreshTrigger],
    queryFn: async () => {
      let query = `
        SELECT e.id, e.status, e.nominated_at, e.evaluation_date, e.evaluation_pdf,
               m.name as member_name, m.member_id as member_code
        FROM evaluations e
        JOIN members m ON e.member_id = m.id
        WHERE 1=1
      `;
      
      if (searchTerm) {
        query += ` AND (m.name ILIKE '%${searchTerm}%' OR m.member_id ILIKE '%${searchTerm}%')`;
      }
      
      if (statusFilter !== 'all') {
        query += ` AND e.status = '${statusFilter}'`;
      }
      
      query += ` ORDER BY e.nominated_at DESC`;
      
      const result = await executeSql(query);
      return result.rows || [];
    }
  });

  return (
    <>
      <div className="flex items-center justify-between space-x-2 pb-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[250px]"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="disapproved">Disapproved</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading evaluations...</p>
        </div>
      ) : evaluationsData?.length > 0 ? (
        <div className="border rounded-md">
          <div className="grid grid-cols-5 gap-4 border-b bg-muted/50 p-4 font-medium">
            <div>Member</div>
            <div>Status</div>
            <div>Evaluation Date</div>
            <div>Nominated Date</div>
            <div>Actions</div>
          </div>
          <div className="divide-y">
            {evaluationsData.map((evaluation: EvaluationDisplayItem) => (
              <EvaluationItem key={evaluation.id} evaluation={evaluation} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg border-muted">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-2 text-lg font-semibold">No evaluations found</h3>
          <p className="text-muted-foreground mt-1">
            {searchTerm || statusFilter !== 'all'
              ? "Try changing your search or filter"
              : "Upload evaluations to see them here"}
          </p>
        </div>
      )}
    </>
  );
};

export default EvaluationListTab;
