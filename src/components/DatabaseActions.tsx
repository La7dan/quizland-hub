
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Info } from 'lucide-react';

export default function DatabaseActions() {
  const { toast } = useToast();

  const handleInfoClick = () => {
    toast({
      title: "Information",
      description: "The database cleaning functionality has been removed to preserve quiz data.",
    });
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleInfoClick}
        className="flex items-center gap-2"
      >
        <Info className="h-4 w-4" />
        Database Information
      </Button>
    </div>
  );
}
