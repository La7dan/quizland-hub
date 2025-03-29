
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { executeSql } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Member {
  id: number;
  member_id: string;
  name: string;
  level_name?: string;
  level_code?: string;
  coach_id: number;
  coach_name?: string;
}

interface Coach {
  id: number;
  username: string;
}

interface BulkEvaluationTabProps {
  onSuccess: () => void;
}

const BulkEvaluationTab: React.FC<BulkEvaluationTabProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [selectedCoachId, setSelectedCoachId] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch all coaches
  const { data: coaches, isLoading: isLoadingCoaches } = useQuery({
    queryKey: ['coaches'],
    queryFn: async () => {
      const result = await executeSql(`
        SELECT id, username FROM users 
        WHERE role IN ('coach', 'admin') 
        ORDER BY username
      `);
      return result.rows || [];
    }
  });

  // Fetch members for selected coach that don't have pending evaluations
  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['coachMembers', selectedCoachId],
    queryFn: async () => {
      if (!selectedCoachId) return [];
      
      const result = await executeSql(`
        SELECT m.id, m.member_id, m.name, 
               l.name AS level_name, l.code AS level_code,
               m.coach_id, u.username AS coach_name
        FROM members m
        LEFT JOIN quiz_levels l ON m.level_id = l.id
        LEFT JOIN users u ON m.coach_id = u.id
        WHERE m.coach_id = ${selectedCoachId}
        AND NOT EXISTS (
          SELECT 1 FROM evaluations e 
          WHERE e.member_id = m.id 
          AND e.status = 'pending'
        )
        ORDER BY m.name
      `);
      return result.rows || [];
    },
    enabled: !!selectedCoachId
  });

  // Toggle select all members
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked && members) {
      setSelectedMembers(members.map((m: Member) => m.id));
    } else {
      setSelectedMembers([]);
    }
  };

  // Toggle individual member selection
  const handleSelectMember = (memberId: number, checked: boolean) => {
    if (checked) {
      setSelectedMembers(prev => [...prev, memberId]);
    } else {
      setSelectedMembers(prev => prev.filter(id => id !== memberId));
    }
  };

  // Create bulk evaluations mutation
  const createEvaluationsMutation = useMutation({
    mutationFn: async () => {
      if (!date || selectedMembers.length === 0) {
        throw new Error('Please select date and at least one member');
      }

      const formattedDate = format(date, 'yyyy-MM-dd');
      const memberIds = selectedMembers.join(',');
      
      return await executeSql(`
        WITH eligible_members AS (
          SELECT id 
          FROM members
          WHERE id IN (${memberIds})
          AND NOT EXISTS (
            SELECT 1 FROM evaluations 
            WHERE member_id = members.id 
            AND status = 'pending'
          )
        ),
        inserted_evaluations AS (
          INSERT INTO evaluations (member_id, status, nominated_at, evaluation_date, coach_id)
          SELECT id, 'pending', NOW(), '${formattedDate}', ${selectedCoachId}
          FROM eligible_members
          RETURNING id
        )
        SELECT COUNT(*) as count FROM inserted_evaluations
      `);
    },
    onSuccess: (data) => {
      const count = data.rows[0]?.count || 0;
      
      if (count === 0) {
        toast({
          title: "No evaluations created",
          description: "Selected members already have pending evaluations",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: `Created ${count} pending evaluations for selected members`,
        });
      }
      
      setSelectedMembers([]);
      setSelectAll(false);
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create evaluations",
        variant: "destructive"
      });
    }
  });

  const handleCreateEvaluations = () => {
    if (!date) {
      toast({
        title: "Error",
        description: "Please select an evaluation date",
        variant: "destructive"
      });
      return;
    }

    if (selectedMembers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one member",
        variant: "destructive"
      });
      return;
    }

    createEvaluationsMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Select Coach and Date</CardTitle>
            <CardDescription>Choose a coach and evaluation date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Coach</label>
              <Select
                value={selectedCoachId}
                onValueChange={setSelectedCoachId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select coach" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCoaches ? (
                    <SelectItem value="loading" disabled>Loading coaches...</SelectItem>
                  ) : coaches?.length > 0 ? (
                    coaches.map((coach: Coach) => (
                      <SelectItem key={coach.id} value={coach.id.toString()}>
                        {coach.username}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no_coaches" disabled>No coaches found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Evaluation Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Selected Members</CardTitle>
              <CardDescription>
                {selectedMembers.length} of {members?.length || 0} members selected
              </CardDescription>
            </div>
            <Button 
              onClick={handleCreateEvaluations}
              disabled={selectedMembers.length === 0 || !date || createEvaluationsMutation.isPending}
              className="ml-auto"
            >
              {createEvaluationsMutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Create Evaluations
            </Button>
          </CardHeader>
          <CardContent>
            {selectedCoachId ? (
              isLoadingMembers ? (
                <div className="py-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading members...</p>
                </div>
              ) : members?.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="select-all" 
                      checked={selectAll} 
                      onCheckedChange={handleSelectAll} 
                    />
                    <label htmlFor="select-all" className="text-sm font-medium">
                      Select All Members
                    </label>
                  </div>
                  
                  <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
                    {members.map((member: Member) => (
                      <div key={member.id} className="flex items-center space-x-2 p-2">
                        <Checkbox 
                          id={`member-${member.id}`}
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={(checked) => 
                            handleSelectMember(member.id, checked as boolean)
                          }
                        />
                        <label htmlFor={`member-${member.id}`} className="text-sm flex-grow">
                          <div className="font-medium">{member.name}</div>
                          <div className="text-muted-foreground text-xs">{member.member_id}</div>
                        </label>
                        {member.level_code && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {member.level_code}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center border rounded-md border-dashed">
                  <p className="text-muted-foreground">No members without pending evaluations found for this coach</p>
                </div>
              )
            ) : (
              <div className="py-8 text-center border rounded-md border-dashed">
                <p className="text-muted-foreground">Please select a coach to view members</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BulkEvaluationTab;
