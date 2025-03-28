
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import QuizzesList from '@/components/QuizzesList';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, Moon, Sun } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { getQuizLevels } from '@/services/quizService';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';

export default function QuizzesPage() {
  const [sortBy, setSortBy] = useState<string>("default");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [levels, setLevels] = useState<any[]>([]);
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  
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
    <div>
      <Navigation />
      
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="my-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Explore All Quizzes</h1>
            
            <Toggle
              aria-label="Toggle theme"
              pressed={theme === "dark"}
              onPressedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Toggle>
          </div>
          
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
          
          <QuizzesList sortBy={sortBy} sortOrder={sortOrder} categoryFilter={selectedCategory} />
        </div>
      </div>
    </div>
  );
}
