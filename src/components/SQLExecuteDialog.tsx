
import { useState } from 'react';
import { executeSql } from '@/services/dbService';
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
import { Play, Database } from 'lucide-react';

interface SQLExecuteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExecuted: () => void;
}

const SQLExecuteDialog = ({ open, onOpenChange, onExecuted }: SQLExecuteDialogProps) => {
  const [sql, setSql] = useState('');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<{
    rows?: any[];
    rowCount?: number;
    message?: string;
    error?: string;
  } | null>(null);
  const { toast } = useToast();

  const handleExecute = async () => {
    if (!sql.trim()) {
      toast({
        title: "Error",
        description: "SQL query is required",
        variant: "destructive",
      });
      return;
    }

    setExecuting(true);
    setResult(null);
    try {
      const response = await executeSql(sql);
      
      if (response.success) {
        setResult({
          rows: response.rows,
          rowCount: response.rowCount,
          message: response.message
        });
        toast({
          title: "Success",
          description: response.message,
        });
        onExecuted();
      } else {
        setResult({
          error: response.message
        });
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
        description: "Failed to execute SQL",
        variant: "destructive",
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Execute SQL
          </DialogTitle>
          <DialogDescription>
            Run custom SQL queries against your database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4 flex-grow overflow-hidden flex flex-col">
          <div className="flex-grow overflow-hidden flex flex-col">
            <label htmlFor="sqlQuery" className="block text-sm font-medium text-gray-700 mb-1">
              SQL Query
            </label>
            <Textarea
              id="sqlQuery"
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              placeholder="Enter your SQL query here..."
              className="h-32 resize-none mb-4 flex-shrink-0"
            />

            <Button 
              onClick={handleExecute} 
              disabled={executing}
              className="w-full gap-2 mb-4"
            >
              {executing ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Execute
                </>
              )}
            </Button>

            {result && (
              <div className="border rounded-md p-4 overflow-auto flex-grow">
                <h3 className="font-medium mb-2">Result</h3>
                
                {result.error ? (
                  <div className="text-red-600 text-sm">
                    <p>Error: {result.error}</p>
                  </div>
                ) : (
                  <div className="text-sm">
                    <p className="mb-2 text-green-600">{result.message} ({result.rowCount ?? 0} rows affected)</p>
                    
                    {result.rows && result.rows.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {Object.keys(result.rows[0]).map((key) => (
                                <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {result.rows.map((row, i) => (
                              <tr key={i}>
                                {Object.values(row).map((value, j) => (
                                  <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
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

export default SQLExecuteDialog;
