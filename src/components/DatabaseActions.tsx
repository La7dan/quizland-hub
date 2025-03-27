
import { useState } from 'react';
import { clearAllTables } from '@/services/dbService';
import { AlertTriangle, Eraser, Database, PlusCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DatabaseActionsProps {
  onRefresh: () => void;
  onCreateTable: () => void;
  onExecuteSQL: () => void;
}

const DatabaseActions = ({ onRefresh, onCreateTable, onExecuteSQL }: DatabaseActionsProps) => {
  const [clearingAll, setClearingAll] = useState(false);
  const { toast } = useToast();

  const handleClearAllTables = async () => {
    setClearingAll(true);
    try {
      const result = await clearAllTables();
      if (result.success) {
        toast({
          title: "Success",
          description: "All tables cleared successfully",
        });
        onRefresh();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error clearing all tables:', error);
      toast({
        title: "Error",
        description: "Failed to clear all tables",
        variant: "destructive",
      });
    } finally {
      setClearingAll(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <button
        onClick={onCreateTable}
        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
      >
        <PlusCircle className="h-5 w-5" />
        Create New Table
      </button>
      
      <button
        onClick={onExecuteSQL}
        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
      >
        <Database className="h-5 w-5" />
        Execute SQL
      </button>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors">
            <Eraser className="h-5 w-5" />
            Clear All Tables
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Clear All Tables
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete all data from all tables in the database. This action cannot be undone.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAllTables}
              disabled={clearingAll}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {clearingAll ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Clearing...
                </>
              ) : (
                "Clear All Tables"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DatabaseActions;
