import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getQuizLevels } from '@/services/quiz';
import { getUsers } from '@/services/dbService';
import { importMembers, Member } from '@/services/members/memberService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CSVImport } from './import/CSVImport';
import { ExcelImport } from './import/ExcelImport';
import { ImportResults } from './import/ImportResults';

interface ImportMembersDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onRefresh?: () => void;
}

export const ImportMembersDialog = ({
  isOpen,
  setIsOpen,
  onRefresh
}: ImportMembersDialogProps) => {
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('csv');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: levelsData } = useQuery({
    queryKey: ['quizLevels'],
    queryFn: getQuizLevels
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers
  });

  const coaches = usersData?.users?.filter(user => user.role === 'coach' || user.role === 'admin') || [];

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

  const closeImportDialog = () => {
    setIsOpen(false);
    setImportErrors([]);
    setImportSuccess(false);
    setActiveTab('csv');
  };

  const handleImport = (members: Member[]) => {
    if (members.length === 0) {
      toast({
        title: 'Error',
        description: 'No valid members found to import',
        variant: 'destructive',
      });
      return;
    }
    
    importMembersMutation.mutate(members);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Import Members
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csv">CSV Import</TabsTrigger>
            <TabsTrigger value="excel">Excel Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="csv">
            <CSVImport 
              onImport={handleImport}
              isImporting={importMembersMutation.isPending}
              levelsData={levelsData}
              coaches={coaches}
            />
          </TabsContent>
          
          <TabsContent value="excel">
            <ExcelImport 
              onImport={handleImport}
              isImporting={importMembersMutation.isPending}
              levelsData={levelsData}
              coaches={coaches}
            />
          </TabsContent>
        </Tabs>
        
        <ImportResults 
          errors={importErrors}
          success={importSuccess}
        />
        
        <DialogFooter>
          <Button variant="outline" onClick={closeImportDialog}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
