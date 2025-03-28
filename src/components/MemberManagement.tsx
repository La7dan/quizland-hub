
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, Download, FileText, Trash, Upload, User, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getMembers, createMember, updateMember, deleteMember, importMembers, Member } from '@/services/memberService';
import { getQuizLevels } from '@/services/quizService';
import { getUsers } from '@/services/dbService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MemberManagement({ onRefresh }: { onRefresh?: () => void }) {
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [csvData, setCsvData] = useState('');
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm({
    defaultValues: {
      member_id: '',
      name: '',
      level_id: '',
      classes_count: 0,
      coach_id: ''
    }
  });

  // Fetch members data
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['members'],
    queryFn: getMembers
  });

  // Fetch quiz levels for dropdown
  const { data: levelsData } = useQuery({
    queryKey: ['quizLevels'],
    queryFn: getQuizLevels
  });

  // Fetch coaches (users with coach role) for dropdown
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers
  });

  // Filter coaches (users with coach role)
  const coaches = usersData?.users?.filter(user => user.role === 'coach' || user.role === 'admin') || [];

  // Create member mutation
  const createMemberMutation = useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({
        title: 'Success',
        description: 'Member created successfully',
      });
      closeAddMemberDialog();
      if (onRefresh) onRefresh();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create member: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  // Update member mutation
  const updateMemberMutation = useMutation({
    mutationFn: updateMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({
        title: 'Success',
        description: 'Member updated successfully',
      });
      closeAddMemberDialog();
      if (onRefresh) onRefresh();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update member: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  // Delete member mutation
  const deleteMemberMutation = useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({
        title: 'Success',
        description: 'Member deleted successfully',
      });
      if (onRefresh) onRefresh();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete member: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  // Import members mutation
  const importMembersMutation = useMutation({
    mutationFn: importMembers,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      if (data.errors && data.errors.length > 0) {
        setImportErrors(data.errors);
        setImportSuccess(false);
      } else {
        setImportSuccess(true);
        setImportErrors([]);
        toast({
          title: 'Success',
          description: `Imported ${data.successCount} members successfully`,
        });
        if (onRefresh) onRefresh();
      }
    },
    onError: (error) => {
      setImportSuccess(false);
      toast({
        title: 'Error',
        description: `Failed to import members: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  const openAddMemberDialog = (member?: Member) => {
    if (member) {
      setIsEditMode(true);
      setCurrentMember(member);
      form.reset({
        member_id: member.member_id,
        name: member.name,
        level_id: member.level_id?.toString() || '',
        classes_count: member.classes_count || 0,
        coach_id: member.coach_id?.toString() || ''
      });
    } else {
      setIsEditMode(false);
      setCurrentMember(null);
      form.reset({
        member_id: '',
        name: '',
        level_id: '',
        classes_count: 0,
        coach_id: ''
      });
    }
    setIsAddMemberDialogOpen(true);
  };

  const closeAddMemberDialog = () => {
    setIsAddMemberDialogOpen(false);
    setCurrentMember(null);
    form.reset();
  };

  const openImportDialog = () => {
    setIsImportDialogOpen(true);
    setCsvData('');
    setImportErrors([]);
    setImportSuccess(false);
  };

  const closeImportDialog = () => {
    setIsImportDialogOpen(false);
    setCsvData('');
    setImportErrors([]);
  };

  const onSubmit = (data: any) => {
    if (isEditMode && currentMember) {
      updateMemberMutation.mutate({
        id: currentMember.id,
        member_id: data.member_id,
        name: data.name,
        level_id: data.level_id ? parseInt(data.level_id) : null,
        classes_count: parseInt(data.classes_count),
        coach_id: data.coach_id ? parseInt(data.coach_id) : null
      });
    } else {
      createMemberMutation.mutate({
        member_id: data.member_id,
        name: data.name,
        level_id: data.level_id ? parseInt(data.level_id) : null,
        classes_count: parseInt(data.classes_count),
        coach_id: data.coach_id ? parseInt(data.coach_id) : null
      });
    }
  };

  const handleDeleteMember = (id: number) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      deleteMemberMutation.mutate(id);
    }
  };

  const handleImport = () => {
    if (!csvData.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter CSV data',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Parse CSV data
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const memberIdIndex = headers.indexOf('member_id');
      const nameIndex = headers.indexOf('name');
      const levelCodeIndex = headers.indexOf('level_code');
      const classesCountIndex = headers.indexOf('classes_count');
      const coachIndex = headers.indexOf('coach');
      
      if (memberIdIndex === -1 || nameIndex === -1) {
        toast({
          title: 'Error',
          description: 'CSV must include at least member_id and name columns',
          variant: 'destructive',
        });
        return;
      }
      
      const members: Member[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        
        const member: Member = {
          member_id: values[memberIdIndex],
          name: values[nameIndex]
        };
        
        if (levelCodeIndex !== -1 && values[levelCodeIndex]) {
          const level = levelsData?.levels?.find(l => l.code === values[levelCodeIndex]);
          if (level) {
            member.level_id = level.id;
          }
        }
        
        if (classesCountIndex !== -1 && values[classesCountIndex]) {
          member.classes_count = parseInt(values[classesCountIndex]) || 0;
        }
        
        if (coachIndex !== -1 && values[coachIndex]) {
          const coach = coaches.find(c => c.username === values[coachIndex]);
          if (coach) {
            member.coach_id = coach.id;
          }
        }
        
        members.push(member);
      }
      
      if (members.length === 0) {
        toast({
          title: 'Error',
          description: 'No valid members found in CSV data',
          variant: 'destructive',
        });
        return;
      }
      
      importMembersMutation.mutate(members);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to parse CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const handleDownloadSample = () => {
    const sampleData = 'member_id,name,level_code,classes_count,coach\nSH123456,John Smith,B1,10,coach\nSH654321,Jane Doe,I2,15,admin';
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_members.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Member Management
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => openAddMemberDialog()} size="sm">
            Add Member
          </Button>
          <Button onClick={openImportDialog} variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
        </div>
      </div>

      {membersLoading ? (
        <div className="text-center py-4">Loading members...</div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Coach</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membersData?.members && membersData.members.length > 0 ? (
                membersData.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.member_id}</TableCell>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.level_code ? `${member.level_code} - ${member.level_name}` : 'Not assigned'}</TableCell>
                    <TableCell>{member.classes_count || 0}</TableCell>
                    <TableCell>{member.coach_name || 'Not assigned'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAddMemberDialog(member)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMember(member.id!)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No members found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Member Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Member' : 'Add New Member'}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="member_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. SH123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Member's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="level_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {levelsData?.levels?.map((level) => (
                          <SelectItem key={level.id} value={level.id.toString()}>
                            {level.code} - {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="classes_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classes Count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="coach_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coach</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign a coach" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {coaches.map((coach) => (
                          <SelectItem key={coach.id} value={coach.id!.toString()}>
                            {coach.username} ({coach.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={closeAddMemberDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMemberMutation.isPending || updateMemberMutation.isPending}>
                  {isEditMode ? 'Update' : 'Add'} Member
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Import Members Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Import Members from CSV
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Paste your CSV data below or download a sample file
              </p>
              <Button variant="outline" size="sm" onClick={handleDownloadSample}>
                <Download className="h-4 w-4 mr-2" />
                Sample
              </Button>
            </div>
            
            <Textarea
              placeholder="member_id,name,level_code,classes_count,coach"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
            
            {importErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div>The following errors occurred during import:</div>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {importErrors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {importSuccess && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Members imported successfully!
                </AlertDescription>
              </Alert>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={closeImportDialog}>
                Cancel
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={importMembersMutation.isPending || !csvData.trim()}
              >
                {importMembersMutation.isPending ? 'Importing...' : 'Import Members'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
