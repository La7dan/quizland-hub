import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { executeSql } from '@/services/apiService';

const DatabaseSetupButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const setupDatabase = async () => {
    try {
      setIsLoading(true);
      console.log('Setting up database tables...');
      
      // Fetch the SQL file content
      const response = await fetch('/src/assets/db-setup.sql');
      if (!response.ok) {
        throw new Error(`Failed to fetch SQL: ${response.status} ${response.statusText}`);
      }
      
      const sqlContent = await response.text();
      console.log('SQL content loaded, length:', sqlContent.length);
      
      // Execute SQL to set up all tables
      console.log('Executing database setup SQL...');
      const result = await executeSql(sqlContent);
      
      if (result.success) {
        console.log('Database setup completed successfully');
        toast({
          title: "Success",
          description: "Database setup completed successfully. Tables and initial data created.",
        });
      } else {
        console.error('Database setup failed:', result.message);
        toast({
          title: "Error",
          description: "Database setup failed: " + result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error setting up database:', error);
      toast({
        title: "Error",
        description: "An error occurred during database setup: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      className="flex items-center gap-2" 
      onClick={setupDatabase}
      disabled={isLoading}
      size="sm"
    >
      {isLoading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      {isLoading ? "Setting Up Database..." : "Setup Database"}
    </Button>
  );
};

export default DatabaseSetupButton;
