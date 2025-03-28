
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Download, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getQuizLevels } from '@/services/quizService';
import { getUsers } from '@/services/dbService';
import { importMembers, Member } from '@/services/members/memberService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as XLSX from 'xlsx';

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
  const [csvData, setCsvData] = useState('');
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
    setCsvData('');
    setImportErrors([]);
    setImportSuccess(false);
    setActiveTab('csv');
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

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const excelData = XLSX.utils.sheet_to_json(worksheet);
        
        if (excelData.length === 0) {
          toast({
            title: 'Error',
            description: 'Excel file is empty or has no valid data',
            variant: 'destructive',
          });
          return;
        }
        
        // Process members from Excel data
        const members: Member[] = [];
        
        for (const row of excelData) {
          const rowData = row as Record<string, any>;
          
          // Check for required fields
          if (!rowData.member_id || !rowData.name) {
            continue;
          }
          
          const member: Member = {
            member_id: String(rowData.member_id),
            name: String(rowData.name)
          };
          
          // Match level code if provided
          if (rowData.level_code) {
            const level = levelsData?.levels?.find(l => l.code === rowData.level_code);
            if (level) {
              member.level_id = level.id;
            }
          }
          
          // Set classes count if provided
          if (rowData.classes_count !== undefined) {
            member.classes_count = parseInt(String(rowData.classes_count)) || 0;
          }
          
          // Match coach if provided
          if (rowData.coach) {
            const coach = coaches.find(c => c.username === rowData.coach);
            if (coach) {
              member.coach_id = coach.id;
            }
          }
          
          members.push(member);
        }
        
        if (members.length === 0) {
          toast({
            title: 'Error',
            description: 'No valid members found in Excel data',
            variant: 'destructive',
          });
          return;
        }
        
        importMembersMutation.mutate(members);
        
      } catch (error) {
        toast({
          title: 'Error',
          description: `Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: 'destructive',
        });
      }
    };
    
    reader.onerror = () => {
      toast({
        title: 'Error',
        description: 'Failed to read Excel file',
        variant: 'destructive',
      });
    };
    
    reader.readAsBinaryString(file);
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

  const handleDownloadExcelSample = () => {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['member_id', 'name', 'level_code', 'classes_count', 'coach'],
      ['SH123456', 'John Smith', 'B1', 10, 'coach'],
      ['SH654321', 'Jane Doe', 'I2', 15, 'admin']
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    
    // Generate Excel file and download
    XLSX.writeFile(wb, 'sample_members.xlsx');
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
          
          <TabsContent value="csv" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Paste your CSV data below or download a sample file
              </p>
              <Button variant="outline" size="sm" onClick={handleDownloadSample}>
                <Download className="h-4 w-4 mr-2" />
                Sample CSV
              </Button>
            </div>
            
            <Textarea
              placeholder="member_id,name,level_code,classes_count,coach"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
            
            <Button 
              onClick={handleImport} 
              disabled={importMembersMutation.isPending || !csvData.trim()}
              className="w-full"
            >
              {importMembersMutation.isPending ? 'Importing...' : 'Import CSV Data'}
            </Button>
          </TabsContent>
          
          <TabsContent value="excel" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Upload an Excel file or download a sample template
              </p>
              <Button variant="outline" size="sm" onClick={handleDownloadExcelSample}>
                <Download className="h-4 w-4 mr-2" />
                Sample Excel
              </Button>
            </div>
            
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-10 text-center">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Click to select or drag and drop an Excel file
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                className="hidden"
                id="excel-upload"
              />
              <label htmlFor="excel-upload">
                <Button
                  disabled={importMembersMutation.isPending}
                  variant="outline"
                  className="mx-auto"
                  asChild
                >
                  <span>Select Excel File</span>
                </Button>
              </label>
            </div>
          </TabsContent>
        </Tabs>
        
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
