
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface MembersSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export const MembersSearchFilter: React.FC<MembersSearchFilterProps> = ({ 
  searchTerm, 
  setSearchTerm 
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Search members by name, ID, level, or coach..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};
