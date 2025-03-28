
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { executeSql } from '@/services/apiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileCheck, Download } from 'lucide-react';
import { EvaluationDisplayItem } from './types';
import EvaluationItem from './EvaluationItem';

interface CompletedEvaluationsTabProps {
  refreshTrigger?: number;
}

const CompletedEvaluationsTab: React.FC<CompletedEvaluationsTabProps> = ({ refreshTrigger }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch only completed evaluations (those with PDF files)
  const { data: completedEvaluations, isLoading } = useQuery({
    queryKey: ['completedEvaluations', searchTerm, refreshTrigger],
    queryFn: async () => {
      let query = `
        SELECT e.id, e.status, e.nominated_at, e.evaluation_date, e.evaluation_pdf,
               e.evaluation_result, e.member_id, e.coach_id,
               m.name as member_name, m.member_id as member_code
        FROM evaluations e
        JOIN members m ON e.member_id = m.id
        WHERE e.evaluation_pdf IS NOT NULL
      `;
      
      if (searchTerm) {
        query += ` AND (m.name ILIKE '%${searchTerm}%' OR m.member_id ILIKE '%${searchTerm}%')`;
      }
      
      query += ` ORDER BY e.evaluation_date DESC NULLS LAST`;
      
      const result = await executeSql(query);
      return result.rows || [];
    }
  });

  // Function to export data as CSV
  const exportToCSV = () => {
    if (!completedEvaluations || completedEvaluations.length === 0) return;
    
    const headers = [
      'Member Name', 
      'Member Code', 
      'Status', 
      'Evaluation Date', 
      'Nominated Date'
    ];
    
    const csvData = completedEvaluations.map((item: EvaluationDisplayItem) => [
      item.member_name,
      item.member_code,
      item.status,
      item.evaluation_date ? new Date(item.evaluation_date).toLocaleDateString() : 'Not set',
      new Date(item.nominated_at).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `completed_evaluations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
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
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCSV}
            disabled={!completedEvaluations || completedEvaluations.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading evaluations...</p>
        </div>
      ) : completedEvaluations && completedEvaluations.length > 0 ? (
        <div className="border rounded-md">
          <div className="grid grid-cols-5 gap-4 border-b bg-muted/50 p-4 font-medium">
            <div>Member</div>
            <div>Status</div>
            <div>Evaluation Date</div>
            <div>Nominated Date</div>
            <div>Actions</div>
          </div>
          <div className="divide-y">
            {completedEvaluations.map((evaluation: EvaluationDisplayItem) => (
              <EvaluationItem key={evaluation.id} evaluation={evaluation} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg border-muted">
          <FileCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-2 text-lg font-semibold">No completed evaluations found</h3>
          <p className="text-muted-foreground mt-1">
            {searchTerm
              ? "Try changing your search"
              : "Upload evaluation PDFs for members to see completed evaluations here"}
          </p>
        </div>
      )}
    </div>
  );
};

export default CompletedEvaluationsTab;
