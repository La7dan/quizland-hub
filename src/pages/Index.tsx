
import { useState, useCallback } from 'react';
import DBHeader from '@/components/DBHeader';
import TableList from '@/components/TableList';
import DatabaseActions from '@/components/DatabaseActions';
import CreateTableDialog from '@/components/CreateTableDialog';
import SQLExecuteDialog from '@/components/SQLExecuteDialog';

const Index = () => {
  const [createTableOpen, setCreateTableOpen] = useState(false);
  const [sqlExecuteOpen, setSqlExecuteOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleCreateTable = useCallback(() => {
    setCreateTableOpen(true);
  }, []);

  const handleExecuteSQL = useCallback(() => {
    setSqlExecuteOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <DBHeader />
        
        <DatabaseActions 
          onRefresh={handleRefresh}
          onCreateTable={handleCreateTable}
          onExecuteSQL={handleExecuteSQL}
        />
        
        <TableList 
          key={refreshTrigger} 
          onRefresh={handleRefresh} 
        />
        
        <CreateTableDialog 
          open={createTableOpen}
          onOpenChange={setCreateTableOpen}
          onTableCreated={handleRefresh}
        />
        
        <SQLExecuteDialog 
          open={sqlExecuteOpen}
          onOpenChange={setSqlExecuteOpen}
          onExecuted={handleRefresh}
        />
      </div>
    </div>
  );
};

export default Index;
