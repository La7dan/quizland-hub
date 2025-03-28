
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
      
      // Use the same path as in useDatabaseSetup
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
        toast({
          title: "Success",
          description: "Database structure initialized successfully.",
        });
      } else {
        if (result.message?.includes('already exists')) {
          toast({
            title: "Information",
            description: "Database tables already exist. No changes were made.",
          });
        } else {
          console.error('Database setup failed:', result.message);
          toast({
            title: "Warning",
            description: "Database setup encountered an issue: " + result.message,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error setting up database:', error);
      toast({
        title: "Error",
        description: "Unable to connect to the database server. Please make sure the server is running.",
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
      {isLoading ? "Initializing Database..." : "Initialize Database"}
    </Button>
  );
};

export default DatabaseSetupButton;
