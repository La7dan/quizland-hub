
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { QuizzesList, QuizFilters, PageHeader } from '@/components/quiz';
import { useIsMobile } from '@/hooks/use-mobile';

export default function QuizzesPage() {
  const [sortBy, setSortBy] = useState<string>("default");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const isMobile = useIsMobile();
  
  return (
    <div>
      <Navigation />
      
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="my-8">
          <PageHeader title="Explore All Quizzes" />
          
          <QuizFilters 
            sortBy={sortBy} 
            setSortBy={setSortBy}
            sortOrder={sortOrder} 
            setSortOrder={setSortOrder}
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory}
          />
          
          <QuizzesList 
            sortBy={sortBy} 
            sortOrder={sortOrder} 
            categoryFilter={selectedCategory} 
          />
        </div>
      </div>
    </div>
  );
}
