
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuizLevels } from '@/services/quizService';
import { getUsers } from '@/services/dbService';
import { createMember, updateMember, Member } from '@/services/members/memberService';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddMemberDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isEditMode: boolean;
  currentMember: any;
  onClose: () => void;
  onRefresh?: () => void;
}

export const AddMemberDialog = ({
  isOpen,
  setIsOpen,
  isEditMode,
  currentMember,
  onClose,
  onRefresh
}: AddMemberDialogProps) => {
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

  const { data: levelsData } = useQuery({
    queryKey: ['quizLevels'],
    queryFn: getQuizLevels
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers
  });

  const coaches = usersData?.users?.filter(user => user.role === 'coach' || user.role === 'admin') || [];

  const createMemberMutation = useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({
        title: 'Success',
        description: 'Member created successfully',
      });
      onClose();
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

  const updateMemberMutation = useMutation({
    mutationFn: updateMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({
        title: 'Success',
        description: 'Member updated successfully',
      });
      onClose();
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

  useEffect(() => {
    if (isEditMode && currentMember) {
      form.reset({
        member_id: currentMember.member_id,
        name: currentMember.name,
        level_id: currentMember.level_id?.toString() || '',
        classes_count: currentMember.classes_count || 0,
        coach_id: currentMember.coach_id?.toString() || ''
      });
    } else {
      form.reset({
        member_id: '',
        name: '',
        level_id: '',
        classes_count: 0,
        coach_id: ''
      });
    }
  }, [form, isEditMode, currentMember, isOpen]);

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
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
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign a coach" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
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
              <Button variant="outline" type="button" onClick={onClose}>
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
  );
};
