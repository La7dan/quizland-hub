
import { useState } from 'react';
import DBHeader from '@/components/DBHeader';
import CreateTableDialog from '@/components/CreateTableDialog';
import TableList from '@/components/TableList';
import DatabaseActions from '@/components/DatabaseActions';
import SQLExecuteDialog from '@/components/SQLExecuteDialog';
import UserManagement from '@/components/UserManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Index() {
  const [isCreateTableDialogOpen, setIsCreateTableDialogOpen] = useState(false);
  const [isSQLDialogOpen, setIsSQLDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <DBHeader 
        onOpenCreateTable={() => setIsCreateTableDialogOpen(true)}
        onOpenSQLDialog={() => setIsSQLDialogOpen(true)}
      />

      <div className="mt-6">
        <Tabs defaultValue="tables" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tables">Database Tables</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tables" className="space-y-4">
            <DatabaseActions 
              onRefresh={handleRefresh}
              onCreateTable={() => setIsCreateTableDialogOpen(true)}
              onExecuteSQL={() => setIsSQLDialogOpen(true)}
            />
            <TableList onRefresh={handleRefresh} />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>

      <CreateTableDialog
        open={isCreateTableDialogOpen}
        onOpenChange={setIsCreateTableDialogOpen}
        onTableCreated={handleRefresh}
      />
      
      <SQLExecuteDialog
        open={isSQLDialogOpen}
        onOpenChange={setIsSQLDialogOpen}
        onExecuted={handleRefresh}
      />
    </div>
  );
}
