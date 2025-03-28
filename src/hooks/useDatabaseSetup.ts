import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { executeSql, initializeDatabase } from '@/services/dbService';
import { toast } from 'sonner';
import { ENV } from '@/config/env';
import { useQueryClient } from '@tanstack/react-query';

export const useDatabaseSetup = () => {
  const { toast: uiToast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        setIsConnecting(true);
        console.log('Setting up database tables...');
        
        // Try to fetch the SQL file, but don't throw an error if it fails
        try {
          // Use the correct path for the SQL file - we'll use a relative path from the public directory
          const response = await fetch('/db-setup.sql');
          if (!response.ok) {
            console.warn(`Failed to fetch SQL: ${response.status} ${response.statusText}`);
            // Continue despite the error - we'll try to use the database anyway
          } else {
            const sqlContent = await response.text();
            
            // Execute SQL to set up all tables
            console.log('Executing database setup SQL...');
            try {
              const result = await executeSql(sqlContent);
              
              if (result.success) {
                console.log('Database setup completed successfully');
              } else {
                console.warn('Database setup warning:', result.message);
              }
            } catch (sqlError) {
              console.warn('SQL execution warning:', sqlError);
              // Continue despite the error
            }
          }
        } catch (fetchError) {
          console.warn('Failed to fetch SQL file:', fetchError);
          // Continue despite the error
        }
        
        // Try to initialize the database and prefetch quiz data
        try {
          const initResult = await initializeDatabase();
          if (initResult.success) {
            // Prefetch quizzes data
            queryClient.prefetchQuery({
              queryKey: ['quizzes'],
              queryFn: async () => {
                try {
                  const { getQuizzes } = await import('@/services/quiz');
                  return getQuizzes();
                } catch (error) {
                  console.error('Error prefetching quizzes:', error);
                  return { success: false, message: 'Failed to fetch quizzes' };
                }
              },
              retry: 1
            });
            
            console.log('Quiz data initialized and prefetched');
          }
        } catch (initError) {
          console.warn('Database initialization warning:', initError);
          // Continue despite the error
        }
      } catch (error) {
        console.error('Error setting up database:', error);
        // We won't show an error toast during initialization to avoid confusion
      } finally {
        setIsConnecting(false);
      }
    };
    
    if (ENV.API_BASE_URL) {
      setupDatabase();
    } else {
      console.warn("No API URL configured. Database setup skipped.");
    }
  }, [queryClient]);
  
  return { isConnecting };
};
