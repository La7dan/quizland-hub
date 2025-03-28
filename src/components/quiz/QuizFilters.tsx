
import { useState, useEffect } from 'react';
import { getQuizLevels } from '@/services/quiz';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface QuizFiltersProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (value: "asc" | "desc") => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
}

export function QuizFilters({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  selectedCategory,
  setSelectedCategory
}: QuizFiltersProps) {
  const [levels, setLevels] = useState<any[]>([]);
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  useEffect(() => {
    const fetchLevels = async () => {
      const response = await getQuizLevels();
      if (response.success) {
        setLevels(response.levels || []);
      }
    };
    
    fetchLevels();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="text-sm font-medium whitespace-nowrap">Sort by:</span>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Default order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default order</SelectItem>
            <SelectItem value="level">Level</SelectItem>
            <SelectItem value="pass">Passing score</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button variant="outline" size="icon" onClick={toggleSortOrder} className="w-10 h-10 sm:w-10 sm:h-10">
        {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
      </Button>
      
      <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
        <span className="text-sm font-medium whitespace-nowrap">Filter by Level:</span>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {levels.map((level) => (
              <SelectItem key={level.id} value={String(level.id)}>
                {level.code} - {level.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
