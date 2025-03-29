import React, { useState, useEffect } from 'react';
import { getMembers, Member, deleteMember } from '@/services/members/memberService';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertCircle, User, Trash, UserMinus, Search, ArrowDown, ArrowUp, CircleDot, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MembersTableProps {
  onRefresh?: () => void;
}

type SortField = 'name' | 'member_id' | 'level_code' | 'classes_count' | 'coach_name' | 'evaluation_date';
type SortOrder = 'asc' | 'desc';

const MembersTable: React.FC<MembersTableProps> = ({ onRefresh }) => {
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [duplicateMembers, setDuplicateMembers] = useState<Set<string>>(new Set());
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error: queryError, refetch } = useQuery({
    queryKey: ['members'],
    queryFn: getMembers
  });

  const members = data?.members || [];
  const error = queryError ? String(queryError) : (data?.message && !data.success ? data.message : null);

  useEffect(() => {
    const memberIdCounts: Record<string, number> = {};
    const duplicates = new Set<string>();
    
    members.forEach(member => {
      if (member.member_id) {
        memberIdCounts[member.member_id] = (memberIdCounts[member.member_id] || 0) + 1;
        
        if (memberIdCounts[member.member_id] > 1) {
          duplicates.add(member.member_id);
        }
      }
    });
    
    setDuplicateMembers(duplicates);
  }, [members]);

  const filteredMembers = members.filter((member) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.name?.toLowerCase().includes(searchLower) ||
      member.member_id?.toLowerCase().includes(searchLower) ||
      member.level_code?.toLowerCase().includes(searchLower) ||
      member.coach_name?.toLowerCase().includes(searchLower)
    );
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let aVal = a[sortField as keyof Member];
    let bVal = b[sortField as keyof Member];
    
    aVal = aVal === undefined || aVal === null ? '' : aVal;
    bVal = bVal === undefined || bVal === null ? '' : bVal;
    
    const comparison = String(aVal).localeCompare(String(bVal));
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? 
      <ArrowUp className="inline h-4 w-4 ml-1" /> : 
      <ArrowDown className="inline h-4 w-4 ml-1" />;
  };

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      for (const id of ids) {
        await deleteMember(id);
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({
        title: "Success",
        description: `${selectedMembers.length} members deleted successfully`,
      });
      setSelectedMembers([]);
      if (onRefresh) onRefresh();
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: `Failed to delete members: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  const handleRefresh = () => {
    refetch();
    if (onRefresh) onRefresh();
  };

  const toggleMemberSelection = (id: number) => {
    setSelectedMembers(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(memberId => memberId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const toggleSelectAll = () => {
    if (sortedMembers.length > 0) {
      if (selectedMembers.length === sortedMembers.length) {
        setSelectedMembers([]);
      } else {
        setSelectedMembers(sortedMembers.map(member => member.id!));
      }
    }
  };

  const handleBulkDelete = () => {
    if (selectedMembers.length === 0) {
      toast({
        title: "Info",
        description: "No members selected to delete",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedMembers.length} members?`)) {
      bulkDeleteMutation.mutate(selectedMembers);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not evaluated';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleExportCSV = () => {
    if (!members || members.length === 0) return;
    
    const headers = [
      'Member ID',
      'Name',
      'Level Code',
      'Level Name',
      'Classes Count',
      'Coach',
      'Evaluation Date'
    ];
    
    const csvData = members.map((member) => [
      member.member_id || '',
      member.name || '',
      member.level_code || '',
      member.level_name || '',
      member.classes_count?.toString() || '0',
      member.coach_name || '',
      member.evaluation_date ? format(new Date(member.evaluation_date), 'yyyy-MM-dd') : ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `members_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Members
          </h2>
          <div className="flex gap-2">
            {selectedMembers.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
                className="flex items-center gap-1"
              >
                <UserMinus className="h-4 w-4" />
                Delete Selected ({selectedMembers.length})
              </Button>
            )}
            <Button
              onClick={handleRefresh}
              className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-md text-sm transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={handleExportCSV}
              className="flex items-center gap-1"
              disabled={members.length === 0}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search members by name, ID, level, or coach..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No members found. Click the "Setup Database" button to create sample members or add members manually.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={sortedMembers.length > 0 && selectedMembers.length === sortedMembers.length}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all members"
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('member_id')}
                  >
                    Member ID {renderSortIndicator('member_id')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    Name {renderSortIndicator('name')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('level_code')}
                  >
                    Level {renderSortIndicator('level_code')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('classes_count')}
                  >
                    Classes {renderSortIndicator('classes_count')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('coach_name')}
                  >
                    Coach {renderSortIndicator('coach_name')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('evaluation_date')}
                  >
                    Evaluation Date {renderSortIndicator('evaluation_date')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                      No members match your search criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedMembers.map((member) => (
                    <TableRow key={member.id} className={selectedMembers.includes(member.id!) ? "bg-muted/50" : ""}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedMembers.includes(member.id!)}
                          onCheckedChange={() => toggleMemberSelection(member.id!)}
                          aria-label={`Select ${member.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium flex items-center space-x-1">
                        {member.member_id}
                        {member.member_id && duplicateMembers.has(member.member_id) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <CircleDot className="h-4 w-4 text-blue-500 ml-1" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Duplicate member ID</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>
                        {member.level_code ? (
                          <Badge variant="outline" className="bg-blue-50">
                            {member.level_code} - {member.level_name}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>{member.classes_count || 0}</TableCell>
                      <TableCell>
                        {member.coach_name || <span className="text-gray-400">Not assigned</span>}
                      </TableCell>
                      <TableCell>
                        {formatDate(member.evaluation_date)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default MembersTable;
