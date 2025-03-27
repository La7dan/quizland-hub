
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import QuizzesList from '@/components/QuizzesList';
import { Button } from '@/components/ui/button';

export default function Index() {
  const { isSuperAdmin } = useAuth();

  return (
    <div>
      <Navigation />
      
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="my-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Available Quizzes</h1>
              <p className="text-gray-600 mt-2">
                Browse and take quizzes to test your knowledge
              </p>
            </div>
            
            {isSuperAdmin && (
              <Link to="/admin">
                <Button variant="outline" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin Control Panel
                </Button>
              </Link>
            )}
          </div>
          
          <QuizzesList />
        </div>
      </div>
    </div>
  );
}
