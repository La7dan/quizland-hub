
import { useEffect } from 'react';
import { useUserManagement } from './hooks/useUserManagement';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, RefreshCw } from 'lucide-react';
import UserList from './UserList';
import UserDialogs from './UserDialogs';

const UserManagement = () => {
  const {
    users,
    loading,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    formData,
    setupUserTables,
    fetchUsers,
    handleInputChange,
    handleRoleChange,
    handleOpenAddDialog,
    handleOpenEditDialog,
    handleAddUser,
    handleUpdateUser,
    handleDeleteUser
  } = useUserManagement();

  // Initialize user tables and fetch users on component mount
  useEffect(() => {
    const init = async () => {
      await setupUserTables();
      fetchUsers();
    };
    init();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
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
    </div>
  );
};

export default UserManagement;
