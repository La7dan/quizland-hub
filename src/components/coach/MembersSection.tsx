
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { executeSql } from '@/services/apiService';
import { handleDownload } from '@/components/evaluations/utils';

interface MembersSectionProps {
  coachId: number;
}

type SortField = 'name' | 'member_id' | 'level_code' | 'classes_count' | 'evaluation_date';
type SortOrder = 'asc' | 'desc';

interface Member {
  id: number;
  member_id: string;
  name: string;
  level_id: number;
  level_name: string;
  level_code: string;
  classes_count: number;
  evaluation_date?: string;
  evaluation_pdf?: string;
  evaluation_status?: string;
}

const MembersSection: React.FC<MembersSectionProps> = ({ coachId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  // Fetch members for this coach
  const { data: membersData, isLoading } = useQuery({
    queryKey: ['coachMembers', coachId, sortField, sortOrder, levelFilter],
    queryFn: async () => {
      // Base query to get members with their level info and latest evaluation
      let query = `
        SELECT m.id, m.member_id, m.name, m.classes_count, m.level_id,
               l.name AS level_name, l.code AS level_code,
               e.evaluation_date, e.evaluation_pdf, e.status AS evaluation_status
        FROM members m
        LEFT JOIN quiz_levels l ON m.level_id = l.id
        LEFT JOIN LATERAL (
          SELECT e.evaluation_date, e.evaluation_pdf, e.status
          FROM evaluations e
          WHERE e.member_id = m.id
          ORDER BY e.evaluation_date DESC NULLS LAST
          LIMIT 1
        ) e ON true
        WHERE m.coach_id = ${coachId}
      `;
      
      // Add level filter if selected
      if (levelFilter !== 'all') {
        query += ` AND l.id = ${levelFilter}`;
      }
      
      // Add sorting
      query += ` ORDER BY ${sortField} ${sortOrder}`;
      
      const result = await executeSql(query);
      return result.rows || [];
    }
  });

  // Fetch levels for filter dropdown
  const { data: levels } = useQuery({
    queryKey: ['levels'],
    queryFn: async () => {
      const query = `
        SELECT id, name, code FROM quiz_levels ORDER BY code
      `;
      const result = await executeSql(query);
      return result.rows || [];
    }
  });

  // Filter members based on search term
  const filteredMembers = membersData?.filter((member: Member) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      member.name?.toLowerCase().includes(searchLower) ||
      member.member_id?.toLowerCase().includes(searchLower) ||
      member.level_code?.toLowerCase().includes(searchLower)
    );
  });

  // Handle sort change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? 
      <ArrowUp className="inline h-4 w-4 ml-1" /> : 
      <ArrowDown className="inline h-4 w-4 ml-1" />;
  };

  // Format date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not evaluated';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Members</CardTitle>
        <CardDescription>
          View and manage members assigned to you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            {/* Search bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Level filter */}
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels?.map((level: any) => (
                  <SelectItem key={level.id} value={level.id.toString()}>
                    {level.code} - {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading members...</p>
            </div>
          ) : filteredMembers?.length === 0 ? (
            <div className="py-8 text-center border rounded-md border-dashed">
              <p className="text-muted-foreground">No members found</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-muted/50 p-4 font-medium">
                <div className="cursor-pointer" onClick={() => handleSort('member_id')}>
                  Member ID {renderSortIndicator('member_id')}
                </div>
                <div className="cursor-pointer" onClick={() => handleSort('name')}>
                  Name {renderSortIndicator('name')}
                </div>
                <div className="cursor-pointer" onClick={() => handleSort('level_code')}>
                  Level {renderSortIndicator('level_code')}
                </div>
                <div className="cursor-pointer" onClick={() => handleSort('classes_count')}>
                  Classes {renderSortIndicator('classes_count')}
                </div>
                <div className="cursor-pointer" onClick={() => handleSort('evaluation_date')}>
                  Evaluation {renderSortIndicator('evaluation_date')}
                </div>
              </div>
              
              <div className="divide-y">
                {filteredMembers?.map((member: Member) => (
                  <div key={member.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 items-center">
                    <div className="font-medium">
                      {member.member_id}
                    </div>
                    <div>
                      {member.name}
                    </div>
                    <div>
                      {member.level_code ? (
                        <Badge variant="outline" className="bg-blue-50">
                          {member.level_code} - {member.level_name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                      )}
                    </div>
                    <div>
                      {member.classes_count}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <span className="text-sm">
                        {formatDate(member.evaluation_date)}
                      </span>
                      {member.evaluation_pdf && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 gap-1"
                          onClick={() => handleDownload(member.evaluation_pdf!)}
                        >
                          <Download className="h-3 w-3" />
                          <span>PDF</span>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MembersSection;
