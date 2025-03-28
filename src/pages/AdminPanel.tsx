
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import DBHeader from '@/components/DBHeader';
import CreateTableDialog from '@/components/CreateTableDialog';
import TableList from '@/components/TableList';
import DatabaseActions from '@/components/DatabaseActions';
import SQLExecuteDialog from '@/components/SQLExecuteDialog';
import UserManagement from '@/components/UserManagement';
import SQLViewerDialog from '@/components/SQLViewerDialog';
import QuizManagement from '@/components/QuizManagement';
import QuizAttempts from '@/components/QuizAttempts';
import MemberManagement from '@/components/MemberManagement';
import MembersTable from '@/components/MembersTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DatabaseSetupButton from '@/components/DatabaseSetupButton';
import EvaluationManagement from '@/components/EvaluationManagement';

export default function AdminPanel() {
  const { user } = useAuth();
  const [isCreateTableDialogOpen, setIsCreateTableDialogOpen] = useState(false);
  const [isSQLDialogOpen, setIsSQLDialogOpen] = useState(false);
  const [isSQLViewerOpen, setIsSQLViewerOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div>
      <Navigation />
      
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/30 p-6 rounded-lg mb-6 border border-primary/20 shadow-md">
          <h1 className="text-2xl font-bold text-primary">Admin Control Panel</h1>
          <p className="text-muted-foreground mt-2">
            Welcome, {user?.username}. You have super admin access to the system.
          </p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <DBHeader 
            onOpenCreateTable={() => setIsCreateTableDialogOpen(true)}
            onOpenSQLDialog={() => setIsSQLDialogOpen(true)}
          />
          <DatabaseSetupButton />
        </div>

        <div className="flex justify-end mb-2">
          <button
            onClick={() => setIsSQLViewerOpen(true)}
            className="text-sm bg-primary hover:bg-primary/80 text-primary-foreground px-3 py-1 rounded-md transition-colors flex items-center gap-2"
          >
            <span className="hidden sm:inline">View SQL Setup File</span>
            <span className="sm:hidden">SQL Setup</span>
          </button>
        </div>

        <div className="mt-2">
          <Tabs defaultValue="tables" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="tables">Database Tables</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
              <TabsTrigger value="attempts">Quiz Attempts</TabsTrigger>
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

            <TabsContent value="members" className="space-y-4">
              <MembersTable onRefresh={handleRefresh} />
              <MemberManagement onRefresh={handleRefresh} />
            </TabsContent>
            
            <TabsContent value="evaluations">
              <EvaluationManagement onRefresh={handleRefresh} />
            </TabsContent>

            <TabsContent value="quizzes">
              <QuizManagement onRefresh={handleRefresh} />
            </TabsContent>

            <TabsContent value="attempts">
              <QuizAttempts onRefresh={handleRefresh} />
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

        <SQLViewerDialog
          open={isSQLViewerOpen}
          onOpenChange={setIsSQLViewerOpen}
        />
      </div>
    </div>
  );
}
