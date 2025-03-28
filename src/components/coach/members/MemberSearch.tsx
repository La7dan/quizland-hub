
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MemberSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  levelFilter: string;
  onLevelFilterChange: (value: string) => void;
  levels: any[];
}

export const MemberSearch: React.FC<MemberSearchProps> = ({
  searchTerm,
  onSearchChange,
  levelFilter,
  onLevelFilterChange,
  levels
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      {/* Search bar */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {/* Level filter */}
      <Select value={levelFilter} onValueChange={onLevelFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          {levels?.map((level: any) => (
            <SelectItem key={level.id} value={level.id.toString()}>
              {level.code} - {level.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
