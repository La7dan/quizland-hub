
import { useEffect } from 'react';
import { User, Delete, Edit, UserPlus, RefreshCw, Upload } from 'lucide-react';
import { useUserManagement } from './hooks/useUserManagement';
import { UserList } from './UserList';
import { Button } from '@/components/ui/button';
import { ImportUsersDialog } from './import/ImportUsersDialog';
import { UserDialogs } from './UserDialogs';

const UserManagement = () => {
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

  useEffect(() => {
    const init = async () => {
      await setupUserTables();
      fetchUsers();
    };
    init();
  }, []);

  return (
    <div className="rounded-md border">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-medium flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          User Management
        </h2>
        <div className="flex gap-2">
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
