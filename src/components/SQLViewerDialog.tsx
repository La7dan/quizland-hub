
import { useState, useEffect } from 'react';
import { executeSql } from '@/services/apiService';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Database, Copy, Check } from 'lucide-react';

interface SQLViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SQLViewerDialog = ({ open, onOpenChange }: SQLViewerDialogProps) => {
  const [sqlContent, setSqlContent] = useState('');
  const [executing, setExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load the SQL file content
    const loadSqlFile = async () => {
      try {
        const response = await fetch('/src/assets/db-setup.sql');
        const text = await response.text();
        setSqlContent(text);
      } catch (error) {
        console.error('Error loading SQL file:', error);
        setSqlContent('-- Error loading SQL file');
      }
    };

    if (open) {
      loadSqlFile();
    }
  }, [open]);

  const handleExecute = async () => {
    if (!sqlContent.trim()) {
      toast({
        title: "Error",
        description: "SQL content is empty",
        variant: "destructive",
      });
      return;
    }

    setExecuting(true);
    try {
      const response = await executeSql(sqlContent);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Database setup executed successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error executing SQL:', error);
      toast({
        title: "Error",
        description: "Failed to execute SQL setup",
        variant: "destructive",
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlContent).then(() => {
      setCopied(true);
      toast({
        title: "Copied",
        description: "SQL content copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            Database Setup SQL
          </DialogTitle>
          <DialogDescription>
            This file contains SQL commands to set up your database schema. You can copy these commands and execute them in the SQL Execute dialog.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4 flex-grow overflow-hidden flex flex-col">
          <div className="flex-grow overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="sqlContent" className="block text-sm font-medium text-gray-700">
                SQL Setup Commands
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-1 text-xs h-8"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <Textarea
              id="sqlContent"
              value={sqlContent}
              readOnly
              className="h-[400px] resize-none mb-4 font-mono text-sm"
            />

            <Button 
              onClick={handleExecute} 
              disabled={executing}
              className="w-full gap-2 mb-4"
            >
              {executing ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Executing Setup...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Execute All Setup Commands
                </>
              )}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SQLViewerDialog;
