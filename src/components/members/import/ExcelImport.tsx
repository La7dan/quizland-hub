import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { parseExcelFile, generateSampleExcel } from './importUtils';
import { Member } from '@/services/members/memberService';
import { useToast } from '@/hooks/use-toast';

interface ExcelImportProps {
  onImport: (members: Member[]) => void;
  isImporting: boolean;
  levelsData: any;
  coaches: any[];
}

export const ExcelImport = ({
  onImport,
  isImporting,
  levelsData,
  coaches
}: ExcelImportProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setUploadProgress(10); // Start progress
    
    try {
      // Simulate progress during processing
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const nextProgress = prev + 10;
          return nextProgress < 90 ? nextProgress : prev; // Cap at 90% until complete
        });
      }, 200);
      
      const { members, error } = await parseExcelFile(file, levelsData, coaches);
      
      clearInterval(progressInterval);
      setUploadProgress(100); // Complete progress
      
      if (error) {
        toast({
          title: 'Error',
          description: error,
          variant: 'destructive',
        });
        // Reset after error
        setTimeout(() => {
          setUploadProgress(0);
          setFileName(null);
        }, 2000);
        return;
      }
      
      onImport(members);
      // Keep the 100% for a moment
      setTimeout(() => {
        setUploadProgress(0);
        setFileName(null);
      }, 2000);
    } catch (error) {
      setUploadProgress(0);
      setFileName(null);
      toast({
        title: 'Error',
        description: `Failed to process Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
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
      
      {uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{fileName}</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
      
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
            disabled={isImporting}
            variant="outline"
            className="mx-auto"
            asChild
          >
            <span>Select Excel File</span>
          </Button>
        </label>
      </div>
    </div>
  );
};
