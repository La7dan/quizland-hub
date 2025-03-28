
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { executeSql } from '@/services/dbService';
import { ENV } from '@/config/env';

export const useDatabaseSetup = () => {
  const { toast } = useToast();
  
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        console.log('Setting up database tables...');
        // Fetch the SQL file content
        const response = await fetch('/src/assets/db-setup.sql');
        if (!response.ok) {
          throw new Error(`Failed to fetch SQL: ${response.status} ${response.statusText}`);
        }
        
        const sqlContent = await response.text();
        
        // Execute SQL to set up all tables
        console.log('Executing database setup SQL...');
        const result = await executeSql(sqlContent);
        
        if (result.success) {
          console.log('Database setup completed successfully');
        } else {
          console.error('Database setup failed:', result.message);
          // Show toast only if it's a real error, not just a warning about tables already existing
          if (!result.message?.includes('already exists')) {
            toast({
              title: "Database Setup Warning",
              description: "Some database tables could not be fully initialized. Application may have limited functionality.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Error setting up database:', error);
        // Don't show error toast during initialization to avoid confusion
      }
    };
    
    if (ENV.API_BASE_URL) {
      setupDatabase();
    } else {
      console.warn("No API URL configured. Database setup skipped.");
    }
  }, []);
};
