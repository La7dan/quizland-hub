
import { useEffect, useState } from 'react';
import { User, Delete, Edit, UserPlus, RefreshCw, Upload, Trash2 } from 'lucide-react';
import { useUserManagement } from './hooks/useUserManagement';
import { UserList } from './UserList';
import { Button } from '@/components/ui/button';
import { ImportUsersDialog } from './import/ImportUsersDialog';
import { UserDialogs } from './UserDialogs';
import { useBulkDeleteUsers } from './hooks/useBulkDeleteUsers';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const UserManagement = () => {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  
  const {
    users,
    loading,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isImportDialogOpen,
    setIsImportDialogOpen,
    formData,
    currentUser,
    setupUserTables,
    fetchUsers,
    handleInputChange,
    handleRoleChange,
    handleOpenAddDialog,
    handleOpenEditDialog,
    handleOpenImportDialog,
    handleAddUser,
    handleUpdateUser,
    handleDeleteUser,
    handleImportUsers
  } = useUserManagement();

  const { bulkDeleteUsersMutation } = useBulkDeleteUsers({
    onRefresh: fetchUsers,
    onSuccess: () => setSelectedUsers([])
  });

  useEffect(() => {
    const init = async () => {
      await setupUserTables();
      fetchUsers();
    };
    init();
  }, []);

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const toggleSelectAll = () => {
    if (users.length > 0) {
      if (selectedUsers.length === users.length) {
        setSelectedUsers([]);
      } else {
        setSelectedUsers(users.map(user => user.id!).filter(Boolean));
      }
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length > 0) {
      bulkDeleteUsersMutation.mutate(selectedUsers);
    }
  };

  return (
    <div className="rounded-md border">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-medium flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          User Management
        </h2>
        <div className="flex gap-2">
          {selectedUsers.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected ({selectedUsers.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Bulk Delete Users</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedUsers.length} selected users? 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            onClick={fetchUsers}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleOpenImportDialog}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button
            onClick={handleOpenAddDialog}
            size="sm"
            className="flex items-center gap-1"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>
      
      <UserList 
        users={users} 
        loading={loading} 
        selectedUsers={selectedUsers}
        toggleUserSelection={toggleUserSelection}
        toggleSelectAll={toggleSelectAll}
        handleOpenEditDialog={handleOpenEditDialog} 
        handleDeleteUser={handleDeleteUser} 
      />

      <UserDialogs 
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        formData={formData}
        handleInputChange={handleInputChange}
        handleRoleChange={handleRoleChange}
        handleAddUser={handleAddUser}
        handleUpdateUser={handleUpdateUser}
      />

      <ImportUsersDialog
        isOpen={isImportDialogOpen}
        setIsOpen={setIsImportDialogOpen}
        onImportComplete={fetchUsers}
      />
    </div>
  );
};

export default UserManagement;
