
import { useState, useEffect } from 'react';
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
import { Progress } from '@/components/ui/progress';

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
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: levelsData, isLoading: levelsLoading } = useQuery({
    queryKey: ['quizLevels'],
    queryFn: getQuizLevels,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (levelsData?.levels) {
      console.log('Levels data loaded:', levelsData.levels);
    }
  }, [levelsData]);

  const coaches = usersData?.users?.filter(user => user.role === 'coach' || user.role === 'admin') || [];

  // Define importMembersMutation BEFORE using it in the useEffect below
  const importMembersMutation = useMutation({
    mutationFn: importMembers,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      console.log('Import results:', data);
      
      if (data.errors && data.errors.length > 0) {
        setImportErrors(data.errors);
        setImportSuccess(data.successCount && data.successCount > 0);
        
        toast({
          title: 'Import Completed With Warnings',
          description: `Imported ${data.successCount || 0} members with ${data.errorCount || 0} errors`,
          variant: 'default',
        });
      } else {
        setImportSuccess(true);
        setImportErrors([]);
        toast({
          title: 'Success',
          description: `Imported ${data.successCount} members successfully`,
        });
      }
      
      if (onRefresh) onRefresh();
    },
    onError: (error) => {
      setImportSuccess(false);
      setProcessingProgress(0);
      toast({
        title: 'Error',
        description: `Failed to import members: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });
  
  // Set up progress updates during import
  useEffect(() => {
    if (importMembersMutation.isPending) {
      let progress = 10;
      const interval = setInterval(() => {
        // Simulate progress, capping at 95% until completely done
        progress = Math.min(progress + 5, 95);
        setProcessingProgress(progress);
      }, 500);
      
      return () => clearInterval(interval);
    } else if (importMembersMutation.isSuccess) {
      setProcessingProgress(100);
      // Reset after success
      const timer = setTimeout(() => setProcessingProgress(0), 2000);
      return () => clearTimeout(timer);
    } else {
      setProcessingProgress(0);
    }
  }, [importMembersMutation.isPending, importMembersMutation.isSuccess]);

  const closeImportDialog = () => {
    setIsOpen(false);
    setImportErrors([]);
    setImportSuccess(false);
    setActiveTab('csv');
    setProcessingProgress(0);
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
    
    // Start progress
    setProcessingProgress(10);
    
    // Log the members being imported to verify data
    console.log(`Importing ${members.length} members...`);
    
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
        
        {processingProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing import...</span>
              <span>{processingProgress}%</span>
            </div>
            <Progress value={processingProgress} className="h-2" />
            {importMembersMutation.isPending && (
              <p className="text-sm text-muted-foreground text-center">
                This may take a while for large datasets...
              </p>
            )}
          </div>
        )}
        
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
          <Button variant="outline" onClick={closeImportDialog} disabled={importMembersMutation.isPending}>
            {importSuccess ? 'Close' : 'Cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
