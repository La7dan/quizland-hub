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
  const [stats, setStats] = useState<{
    total: number;
    valid: number;
    invalid: number;
    invalidReason?: string[];
  } | null>(null);

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setUploadProgress(10); // Start progress
    setStats(null);
    
    try {
      // Simulate progress during processing
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const nextProgress = prev + 3;
          return nextProgress < 85 ? nextProgress : prev; // Cap at 85% until complete
        });
      }, 100);
      
      const { members, total, invalidRecords, error } = await parseExcelFile(file, levelsData, coaches);
      
      clearInterval(progressInterval);
      setUploadProgress(95); // Almost complete
      
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
          setStats(null);
        }, 3000);
        return;
      }
      
      // Group invalid records by reason for better reporting
      const reasonCounts: Record<string, number> = {};
      invalidRecords.forEach(record => {
        reasonCounts[record.reason] = (reasonCounts[record.reason] || 0) + 1;
      });
      
      // Format reasons with counts
      const formattedReasons = Object.entries(reasonCounts)
        .map(([reason, count]) => `${reason} (${count} records)`)
        .slice(0, 5); // Show top 5 reasons
      
      // Show stats about the import
      setStats({
        total: total,
        valid: members.length,
        invalid: invalidRecords.length,
        invalidReason: formattedReasons
      });
      
      // Log validation issues for debugging
      if (invalidRecords.length > 0) {
        console.log('Invalid records summary:', reasonCounts);
        console.log('Sample invalid records:', invalidRecords.slice(0, 5));
      }
      
      // Complete progress
      setUploadProgress(100);
      
      if (members.length > 0) {
        onImport(members);
        
        toast({
          title: 'Import Processing',
          description: `Processed ${total} records: ${members.length} valid, ${invalidRecords.length} invalid`,
          variant: invalidRecords.length > 0 ? 'default' : 'default',
        });
      } else {
        toast({
          title: 'Import Failed',
          description: 'No valid records found to import',
          variant: 'destructive',
        });
      }
      
      // Keep progress at 100% for a moment
      if (members.length > 0 && invalidRecords.length === 0) {
        // Only reset if everything was successful
        setTimeout(() => {
          setUploadProgress(0);
          setFileName(null);
          setStats(null);
        }, 5000);
      }
    } catch (error) {
      setUploadProgress(0);
      setFileName(null);
      setStats(null);
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
          
          {stats && (
            <div className="mt-2 p-3 bg-muted rounded-md text-sm">
              <p className="font-medium">Import Summary:</p>
              <ul className="mt-1 space-y-1">
                <li>Total records: {stats.total}</li>
                <li className="text-green-600">Valid records: {stats.valid}</li>
                {stats.invalid > 0 && (
                  <li className="text-amber-600">Invalid/skipped records: {stats.invalid}</li>
                )}
                {stats.invalidReason && stats.invalidReason.length > 0 && (
                  <li>
                    <p className="font-medium mt-1">Validation issues:</p>
                    <ul className="list-disc pl-5 mt-1">
                      {stats.invalidReason.map((reason, idx) => (
                        <li key={idx} className="text-xs text-destructive">{reason}</li>
                      ))}
                      {Object.keys(stats.invalidReason).length > 5 && (
                        <li className="text-xs italic">...and more validation issues</li>
                      )}
                    </ul>
                  </li>
                )}
              </ul>
            </div>
          )}
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
