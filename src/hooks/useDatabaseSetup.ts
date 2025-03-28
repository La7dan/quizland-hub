
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { executeSql } from '@/services/apiService';
import { toast } from 'sonner';
import { ENV } from '@/config/env';

export const useDatabaseSetup = () => {
  const { toast: uiToast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        setIsConnecting(true);
        console.log('Setting up database tables...');
        // Use the correct path for the SQL file - we'll use a relative path from the public directory
        const response = await fetch('/db-setup.sql');
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
          // Only show toast if it's a real error, not just a warning about tables already existing
          if (!result.message?.includes('already exists')) {
            // We'll handle this more gracefully now
            console.warn('Database initialization warning:', result.message);
          }
        }
      } catch (error) {
        console.error('Error setting up database:', error);
        // We won't show an error toast during initialization to avoid confusion
        // Instead, this will be handled by the connection status in the UI
      } finally {
        setIsConnecting(false);
      }
    };
    
    if (ENV.API_BASE_URL) {
      setupDatabase();
    } else {
      console.warn("No API URL configured. Database setup skipped.");
    }
  }, []);
  
  return { isConnecting };
};
