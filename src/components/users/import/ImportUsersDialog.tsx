
import { useState, useRef } from 'react';
import { Upload, Download, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User } from '@/services/userService';
import { parseExcelFile, generateSampleExcel } from './importUtils';

interface ImportUsersDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onImportComplete: () => void;
}

export const ImportUsersDialog = ({
  isOpen,
  setIsOpen,
  onImportComplete
}: ImportUsersDialogProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importedUsers, setImportedUsers] = useState<User[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setUploadProgress(10);
    setError(null);
    setIsProcessing(true);
    
    try {
      // Simulate progress during processing
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const nextProgress = prev + 3;
          return nextProgress < 85 ? nextProgress : prev;
        });
      }, 100);
      
      // Parse the Excel file
      const { users, validCount, invalidCount, errors } = await parseExcelFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (users.length === 0) {
        setError('No valid users found in the Excel file');
        setTimeout(() => setUploadProgress(0), 2000);
      } else {
        setImportedUsers(users);
        toast({
          title: 'File Processed',
          description: `Found ${validCount} valid user records${invalidCount > 0 ? ` and ${invalidCount} invalid records` : ''}`,
        });
      }
    } catch (err) {
      setError(`Failed to process Excel file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setUploadProgress(0);
    } finally {
      setIsProcessing(false);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportUsers = async () => {
    if (importedUsers.length === 0) {
      toast({
        title: 'Error',
        description: 'No users to import',
        variant: 'destructive',
      });
      return;
    }
    
    setIsProcessing(true);
    setUploadProgress(50);
    
    // Here we would call the API to import the users
    // For now, we'll just simulate a successful import
    setTimeout(() => {
      setIsProcessing(false);
      setUploadProgress(100);
      toast({
        title: 'Success',
        description: `Successfully imported ${importedUsers.length} users`,
      });
      
      onImportComplete();
      closeDialog();
    }, 1500);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setFileName(null);
    setUploadProgress(0);
    setImportedUsers([]);
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={value => !isProcessing && setIsOpen(value)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Import Coaches/Admins
          </DialogTitle>
        </DialogHeader>
        
        {uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{fileName}</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {importedUsers.length > 0 ? (
          <div className="space-y-4">
            <div className="rounded-md border">
              <div className="p-4 border-b bg-muted/50">
                <h3 className="font-medium">Users to Import ({importedUsers.length})</h3>
              </div>
              <div className="p-4 max-h-[200px] overflow-y-auto">
                <ul className="space-y-2">
                  {importedUsers.map((user, index) => (
                    <li key={index} className="text-sm">
                      <span className="font-medium">{user.username}</span> ({user.email}) - {user.role}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={closeDialog} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handleImportUsers} disabled={isProcessing}>
                Import Users
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Upload an Excel file or download a sample template
              </p>
              <Button variant="outline" size="sm" onClick={generateSampleExcel}>
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
                ref={fileInputRef}
              />
              <label htmlFor="excel-upload">
                <Button
                  disabled={isProcessing}
                  variant="outline"
                  className="mx-auto"
                  asChild
                >
                  <span>Select Excel File</span>
                </Button>
              </label>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog} disabled={isProcessing}>
                Cancel
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
