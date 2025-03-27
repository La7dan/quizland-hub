
import { useState, useEffect } from 'react';
import { getTables, clearTable, DBTable } from '@/services/dbService';
import { Trash2, RefreshCw, TableProperties } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface TableListProps {
  onRefresh: () => void;
}

const TableList = ({ onRefresh }: TableListProps) => {
  const [tables, setTables] = useState<DBTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearingTable, setClearingTable] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTables = async () => {
    setLoading(true);
    try {
      const result = await getTables();
      if (result.success) {
        setTables(result.tables);
      } else {
        toast({
          title: "Error fetching tables",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tables",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleClearTable = async (tableName: string) => {
    setClearingTable(tableName);
    try {
      const result = await clearTable(tableName);
      if (result.success) {
        toast({
          title: "Success",
          description: `Table ${tableName} cleared successfully`,
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

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium flex items-center gap-2">
          <TableProperties className="h-5 w-5 text-blue-600" />
          Database Tables
        </h2>
        <button
          onClick={fetchTables}
          className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-md text-sm transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No tables found in the database.</p>
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
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleClearTable(table.table_name)}
                      disabled={clearingTable === table.table_name}
                      className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800 transition"
                    >
                      {clearingTable === table.table_name ? (
                        <>
                          <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          Clearing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Clear
                        </>
                      )}
                    </button>
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
