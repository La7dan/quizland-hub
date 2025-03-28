
import { TableProperties, RefreshCw } from 'lucide-react';

interface TableListHeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

const TableListHeader = ({ onRefresh, loading }: TableListHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-medium flex items-center gap-2">
        <TableProperties className="h-5 w-5 text-primary" />
        Database Tables
      </h2>
      <button
        onClick={onRefresh}
        className="flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-md text-sm transition-colors"
        disabled={loading}
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </button>
    </div>
  );
};

export default TableListHeader;
