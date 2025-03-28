
import { useState, useEffect } from 'react';
import { getTables, clearTable, deleteTable } from '@/services/dbService';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import TableListHeader from './database/TableListHeader';
import TableListContent from './database/TableListContent';
import TableLoading from './database/TableLoading';
import AuthError from './database/AuthError';

interface TableListProps {
  onRefresh: () => void;
}

const TableList = ({ onRefresh }: TableListProps) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearingTable, setClearingTable] = useState(null);
  const [deletingTable, setDeletingTable] = useState(null);
  const [authError, setAuthError] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

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

  const handleClearTable = async (tableName) => {
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

  const handleDeleteTable = async (tableName) => {
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

  if (authError) {
    return <AuthError />;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <TableListHeader onRefresh={handleManualRefresh} loading={loading} />
      
      {loading ? (
        <TableLoading />
      ) : (
        <TableListContent 
          tables={tables}
          clearingTable={clearingTable}
          deletingTable={deletingTable}
          onClearTable={handleClearTable}
          onDeleteTable={handleDeleteTable}
        />
      )}
    </div>
  );
};

export default TableList;
