
import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { parseCSVData, downloadSampleCSV } from './importUtils';
import { Member } from '@/services/members/memberService';

interface CSVImportProps {
  onImport: (members: Member[]) => void;
  isImporting: boolean;
  levelsData: any;
  coaches: any[];
}

export const CSVImport = ({
  onImport,
  isImporting,
  levelsData,
  coaches
}: CSVImportProps) => {
  const [csvData, setCsvData] = useState('');

  const handleImport = () => {
    if (!csvData.trim()) return;
    
    const { members, error } = parseCSVData(csvData, levelsData, coaches);
    
    if (error) {
      // Error handling is done in the parent component
      onImport([]);
      return;
    }
    
    onImport(members);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Paste your CSV data below or download a sample file
        </p>
        <Button variant="outline" size="sm" onClick={downloadSampleCSV}>
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
        disabled={isImporting || !csvData.trim()}
        className="w-full"
      >
        {isImporting ? 'Importing...' : 'Import CSV Data'}
      </Button>
    </div>
  );
};
