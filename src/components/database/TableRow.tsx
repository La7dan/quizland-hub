
import { X, Trash2 } from 'lucide-react';
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

interface TableRowProps {
  tableName: string;
  clearingTable: string | null;
  deletingTable: string | null;
  onClear: (tableName: string) => void;
  onDelete: (tableName: string) => void;
}

const TableRow = ({ 
  tableName, 
  clearingTable, 
  deletingTable, 
  onClear, 
  onDelete 
}: TableRowProps) => {
  return (
    <tr key={tableName} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{tableName}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right space-x-4">
        <button
          onClick={() => onClear(tableName)}
          disabled={clearingTable === tableName || deletingTable === tableName}
          className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-800 transition"
        >
          {clearingTable === tableName ? (
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
              disabled={clearingTable === tableName || deletingTable === tableName}
              className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800 transition"
            >
              {deletingTable === tableName ? (
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
                Are you sure you want to delete the table "{tableName}"? 
                This action cannot be undone and will permanently remove the table and all of its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(tableName)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </td>
    </tr>
  );
};

export default TableRow;
