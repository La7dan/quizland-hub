
import { useState, useEffect } from 'react';
import { getTables, clearTable, deleteTable, DBTable } from '@/services/dbService';
import { Trash2, RefreshCw, TableProperties, X, AlertTriangle } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TableListProps {
  onRefresh: () => void;
}

const TableList = ({ onRefresh }: TableListProps) => {
  const [tables, setTables] = useState<DBTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearingTable, setClearingTable] = useState<string | null>(null);
  const [deletingTable, setDeletingTable] = useState<string | null>(null);
  const [authError, setAuthError] = useState<boolean>(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchTables = async () => {
    setLoading(true);
    setAuthError(false);
    try {
      console.log('Fetching tables... Authentication status:', isAuthenticated);
      const result = await getTables();
      console.log('Fetch tables result:', result);
      
      if (result.success) {
        setTables(result.tables);
      } else {
        if (result.message === 'Authentication required') {
          setAuthError(true);
          toast({
            title: "Authentication Error",
            description: "Please log in to access database tables",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error fetching tables",
            description: result.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tables. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTables();
    }
  }, [isAuthenticated]);

  const handleClearTable = async (tableName: string) => {
    setClearingTable(tableName);
    try {
      console.log(`Clearing table: ${tableName}`);
      const result = await clearTable(tableName);
      console.log(`Clear table result for ${tableName}:`, result);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Table ${tableName} cleared successfully`,
        });
        // Refresh the table list to reflect changes
        await fetchTables();
        // Also call the parent's refresh function
        onRefresh();
      } else {
        toast({
          title: "Error",
          description: result.message || `Failed to clear table ${tableName}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error clearing table ${tableName}:`, error);
      toast({
        title: "Error",
        description: `Failed to clear table ${tableName}`,
        variant: "destructive",
      });
    } finally {
      setClearingTable(null);
    }
  };

  const handleDeleteTable = async (tableName: string) => {
    setDeletingTable(tableName);
    try {
      console.log(`Deleting table: ${tableName}`);
      const result = await deleteTable(tableName);
      console.log(`Delete table result for ${tableName}:`, result);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Table ${tableName} deleted successfully`,
        });
        // Refresh the table list to reflect changes
        await fetchTables();
        // Also call the parent's refresh function
        onRefresh();
      } else {
        toast({
          title: "Error",
          description: result.message || `Failed to delete table ${tableName}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error deleting table ${tableName}:`, error);
      toast({
        title: "Error",
        description: `Failed to delete table ${tableName}`,
        variant: "destructive",
      });
    } finally {
      setDeletingTable(null);
    }
  };

  // Fetch tables on manual refresh
  const handleManualRefresh = () => {
    fetchTables();
  };

  const handleLogin = () => {
    navigate('/login');
  };

  if (authError) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
          <p className="text-gray-500 mb-4">
            You need to be logged in to view and manage database tables.
          </p>
          <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90">
            Log in to continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium flex items-center gap-2">
          <TableProperties className="h-5 w-5 text-primary" />
          Database Tables
        </h2>
        <button
          onClick={handleManualRefresh}
          className="flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-md text-sm transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No tables found in the database. Use the Setup Database button to create tables.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Table Name
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tables.map((table) => (
                <tr key={table.table_name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{table.table_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-4">
                    <button
                      onClick={() => handleClearTable(table.table_name)}
                      disabled={clearingTable === table.table_name || deletingTable === table.table_name}
                      className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-800 transition"
                    >
                      {clearingTable === table.table_name ? (
                        <>
                          <div className="h-4 w-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                          Clearing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Clear
                        </>
                      )}
                    </button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          disabled={clearingTable === table.table_name || deletingTable === table.table_name}
                          className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800 transition"
                        >
                          {deletingTable === table.table_name ? (
                            <>
                              <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4" />
                              Delete
                            </>
                          )}
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Table</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the table "{table.table_name}"? 
                            This action cannot be undone and will permanently remove the table and all of its data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTable(table.table_name)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TableList;
