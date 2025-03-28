import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { executeSql } from '@/services/apiService';
import { Evaluation } from '@/services/evaluations/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  SortAsc, 
  SortDesc, 
  ArrowUpDown, 
  Filter,
} from 'lucide-react';
import BulkMarkAsPassedButton from './BulkMarkAsPassedButton';
import EvaluationItem from './EvaluationItem';
import { useAuth } from '@/contexts/AuthContext';
import { exportToCSV } from './utils';
import { EvaluationDisplayItem } from './types';

interface EvaluationListTabProps {
  refreshTrigger?: number;
}

type SortField = 'member_name' | 'status' | 'evaluation_result' | 'nominated_at' | 'evaluation_date' | 'coach_name' | 'member_level';
type SortOrder = 'asc' | 'desc';

interface Filter {
  status?: string;
  level?: string;
  coach?: string;
}

const EvaluationListTab: React.FC<EvaluationListTabProps> = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortField, setSortField] = useState<SortField>('nominated_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filters, setFilters] = useState<Filter>({});

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  // Fetch all evaluation data including coach and member level information
  const { data, isLoading } = useQuery({
    queryKey: ['allEvaluations', refreshTrigger],
    queryFn: async () => {
      console.log('Fetching all evaluations...');
      const result = await executeSql(`
        SELECT e.*, 
               m.name as member_name, 
               m.member_id as member_code,
               m.level as member_level,
               u.username as coach_name
        FROM evaluations e
        JOIN members m ON e.member_id = m.id
        LEFT JOIN users u ON e.coach_id = u.id
        ORDER BY e.nominated_at DESC
      `);
      console.log('Evaluations fetch result:', result);
      return result.rows || [];
    }
  });

  // Fetch unique coaches and levels for filters
  const { data: filterOptions } = useQuery({
    queryKey: ['evaluationFilterOptions'],
    queryFn: async () => {
      const coachesResult = await executeSql(`
        SELECT DISTINCT u.id, u.username 
        FROM users u 
        JOIN evaluations e ON u.id = e.coach_id 
        WHERE u.role = 'coach'
        ORDER BY u.username
      `);
      
      const levelsResult = await executeSql(`
        SELECT DISTINCT m.level 
        FROM members m 
        JOIN evaluations e ON m.id = e.member_id 
        ORDER BY m.level
      `);
      
      const statusesResult = await executeSql(`
        SELECT DISTINCT status FROM evaluations
      `);
      
      return {
        coaches: coachesResult.rows || [],
        levels: levelsResult.rows.map(row => row.level).filter(Boolean) || [],
        statuses: statusesResult.rows.map(row => row.status) || []
      };
    }
  });

  // Apply search, filtering and sorting
  const filteredEvaluations = useMemo(() => {
    if (!data) return [];
    
    console.log('Processing evaluations data:', data.length, 'records');
    
    return data
      .filter((evaluation: any) => {
        // Search functionality
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || 
          (evaluation.member_name && evaluation.member_name.toLowerCase().includes(searchLower)) ||
          (evaluation.member_code && evaluation.member_code.toLowerCase().includes(searchLower)) ||
          (evaluation.coach_name && evaluation.coach_name.toLowerCase().includes(searchLower));
        
        // Filter functionality
        const matchesStatus = !filters.status || evaluation.status === filters.status;
        const matchesLevel = !filters.level || evaluation.member_level === filters.level;
        const matchesCoach = !filters.coach || evaluation.coach_id?.toString() === filters.coach;
        
        return matchesSearch && matchesStatus && matchesLevel && matchesCoach;
      })
      .sort((a: any, b: any) => {
        // Apply sorting
        let valA = a[sortField];
        let valB = b[sortField];
        
        // Handle dates
        if (sortField === 'nominated_at' || sortField === 'evaluation_date') {
          valA = valA ? new Date(valA).getTime() : 0;
          valB = valB ? new Date(valB).getTime() : 0;
        } 
        // Handle strings
        else if (typeof valA === 'string' && typeof valB === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        
        // Handle null/undefined values
        if (valA === null || valA === undefined) return sortOrder === 'asc' ? -1 : 1;
        if (valB === null || valB === undefined) return sortOrder === 'asc' ? 1 : -1;
        
        return sortOrder === 'asc' 
          ? (valA > valB ? 1 : -1) 
          : (valA < valB ? 1 : -1);
      });
  }, [data, searchTerm, sortField, sortOrder, filters]);

  const handleSelectAll = (checked: boolean) => {
    if (checked && filteredEvaluations) {
      setSelectedIds(filteredEvaluations.map((evaluation: any) => evaluation.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(evalId => evalId !== id));
    }
  };

  const resetSelection = () => {
    setSelectedIds([]);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4 inline" />;
    }
    return sortOrder === 'asc' 
      ? <SortAsc className="ml-1 h-4 w-4 inline text-primary" /> 
      : <SortDesc className="ml-1 h-4 w-4 inline text-primary" />;
  };

  const handleExportCSV = () => {
    if (!filteredEvaluations || filteredEvaluations.length === 0) return;
    
    const exportData = filteredEvaluations.map((item: any) => ({
      'Member Name': item.member_name || 'N/A',
      'Member ID': item.member_code || 'N/A',
      'Level': item.member_level || 'N/A',
      'Status': item.status || 'N/A',
      'Result': item.evaluation_result || 'N/A',
      'Coach': item.coach_name || 'N/A',
      'Nominated Date': item.nominated_at ? format(new Date(item.nominated_at), 'PP') : 'N/A',
      'Evaluation Date': item.evaluation_date ? format(new Date(item.evaluation_date), 'PP') : 'N/A'
    }));
    
    exportToCSV(exportData, `evaluations_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  console.log('Rendering evaluation list with:', {
    dataLength: data?.length || 0,
    filteredLength: filteredEvaluations?.length || 0,
    isLoading
  });

  if (isLoading) {
    return <div className="py-8 text-center">Loading evaluations...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="py-8 text-center">No evaluations found in the database.</div>;
  }

  if (filteredEvaluations.length === 0) {
    return <div className="py-8 text-center">
      No evaluations match the current filters.
      {Object.keys(filters).length > 0 && (
        <div className="mt-2">
          <Button variant="outline" size="sm" onClick={() => setFilters({})}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 mb-6">
        {/* Search box */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[250px]"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Select 
              value={filters.status || ''} 
              onValueChange={(value) => setFilters({...filters, status: value || undefined})}
            >
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <span>Status</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                {filterOptions?.statuses.map((status: string) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Select 
              value={filters.level || ''} 
              onValueChange={(value) => setFilters({...filters, level: value || undefined})}
            >
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <span>Level</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                {filterOptions?.levels.map((level: string) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Select 
              value={filters.coach || ''} 
              onValueChange={(value) => setFilters({...filters, coach: value || undefined})}
            >
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <span>Coach</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Coaches</SelectItem>
                {filterOptions?.coaches.map((coach: any) => (
                  <SelectItem key={coach.id} value={coach.id.toString()}>
                    {coach.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setFilters({})}
            disabled={Object.keys(filters).length === 0}
          >
            Clear Filters
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportCSV}
            disabled={filteredEvaluations.length === 0}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {isAdmin && (
        <div className="flex justify-end mb-4">
          <BulkMarkAsPassedButton 
            selectedIds={selectedIds} 
            onReset={resetSelection} 
          />
        </div>
      )}
      
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && (
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedIds.length === filteredEvaluations?.length && filteredEvaluations?.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead className="cursor-pointer" onClick={() => toggleSort('member_name')}>
                Member {getSortIcon('member_name')}
              </TableHead>
              {filterOptions?.levels.length > 0 && (
                <TableHead>Level</TableHead>
              )}
              <TableHead className="cursor-pointer" onClick={() => toggleSort('status')}>
                Status {getSortIcon('status')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('evaluation_result')}>
                Result {getSortIcon('evaluation_result')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('nominated_at')}>
                Nominated {getSortIcon('nominated_at')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('evaluation_date')}>
                Evaluation Date {getSortIcon('evaluation_date')}
              </TableHead>
              {filterOptions?.coaches.length > 0 && (
                <TableHead>Coach</TableHead>
              )}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvaluations?.map((evaluation: any) => (
              <TableRow key={evaluation.id}>
                {isAdmin && (
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.includes(evaluation.id!)}
                      onCheckedChange={(checked) => 
                        handleSelectOne(evaluation.id!, checked as boolean)
                      }
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div className="font-medium">{evaluation.member_name}</div>
                  <div className="text-sm text-muted-foreground">{evaluation.member_code}</div>
                </TableCell>
                {filterOptions?.levels.length > 0 && (
                  <TableCell>{evaluation.member_level || 'N/A'}</TableCell>
                )}
                <TableCell>
                  <Badge 
                    variant={
                      evaluation.status === 'approved' ? 'success' :
                      evaluation.status === 'disapproved' ? 'destructive' : 'default'
                    }
                  >
                    {evaluation.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {evaluation.evaluation_result ? (
                    <Badge 
                      variant={evaluation.evaluation_result === 'passed' ? 'success' : 'destructive'}
                    >
                      {evaluation.evaluation_result}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {evaluation.nominated_at 
                    ? format(new Date(evaluation.nominated_at), 'PP')
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  {evaluation.evaluation_date 
                    ? format(new Date(evaluation.evaluation_date), 'PP')
                    : 'Not set'}
                </TableCell>
                {filterOptions?.coaches.length > 0 && (
                  <TableCell>{evaluation.coach_name || 'Not assigned'}</TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <EvaluationItem evaluation={{
                      id: evaluation.id!,
                      status: evaluation.status,
                      nominated_at: evaluation.nominated_at,
                      member_name: evaluation.member_name!,
                      member_code: evaluation.member_code!,
                      evaluation_date: evaluation.evaluation_date,
                      evaluation_pdf: evaluation.evaluation_pdf,
                      evaluation_result: evaluation.evaluation_result,
                      member_id: evaluation.member_id,
                      coach_id: evaluation.coach_id,
                      member_level: evaluation.member_level,
                      coach_name: evaluation.coach_name
                    }} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EvaluationListTab;
