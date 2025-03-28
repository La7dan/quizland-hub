
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cleanDummyData } from '@/services/dbService';
import { Trash2, RefreshCw } from 'lucide-react';

export default function DatabaseActions() {
  const [isCleaningData, setIsCleaningData] = useState(false);
  const { toast } = useToast();

  const handleCleanDummyData = async () => {
    try {
      setIsCleaningData(true);
      
      const result = await cleanDummyData();
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error cleaning dummy data:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while cleaning data",
        variant: "destructive"
      });
    } finally {
      setIsCleaningData(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={handleCleanDummyData}
        disabled={isCleaningData}
        className="flex items-center gap-2"
      >
        {isCleaningData ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        {isCleaningData ? "Cleaning Data..." : "Clean Quiz Data"}
      </Button>
    </div>
  );
}
