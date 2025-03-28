
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download } from 'lucide-react';

interface SearchExportBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onExport: () => void;
  hasData: boolean;
}

const SearchExportBar: React.FC<SearchExportBarProps> = ({
  searchTerm,
  setSearchTerm,
  onExport,
  hasData
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 pb-4">
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            className="pl-8 w-full sm:w-[250px]"
          />
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onExport}
        disabled={!hasData}
        className="w-full sm:w-auto"
      >
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
    </div>
  );
};

export default SearchExportBar;
