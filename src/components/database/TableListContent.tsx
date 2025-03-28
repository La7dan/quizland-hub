
import { DBTable } from '@/services/dbService';
import TableRow from './TableRow';
import EmptyTableList from './EmptyTableList';

interface TableListContentProps {
  tables: DBTable[];
  clearingTable: string | null;
  deletingTable: string | null;
  onClearTable: (tableName: string) => void;
  onDeleteTable: (tableName: string) => void;
}

const TableListContent = ({ 
  tables, 
  clearingTable, 
  deletingTable, 
  onClearTable, 
  onDeleteTable 
}: TableListContentProps) => {
  if (tables.length === 0) {
    return <EmptyTableList />;
  }

  return (
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
            <TableRow
              key={table.table_name}
              tableName={table.table_name}
              clearingTable={clearingTable}
              deletingTable={deletingTable}
              onClear={onClearTable}
              onDelete={onDeleteTable}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableListContent;
