import { useEffect } from 'react';
import { User, Delete, Edit, UserPlus, RefreshCw, Upload } from 'lucide-react';
import { useUserManagement } from './users/hooks/useUserManagement';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import UserForm from './users/UserForm';
import { Badge } from '@/components/ui/badge';
import { ImportUsersDialog } from './users/import/ImportUsersDialog';

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

  const renderRoleBadge = (role: string) => {
    let badgeClass = "";
    
    switch(role) {
      case 'super_admin':
        badgeClass = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
        break;
      case 'admin':
        badgeClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        break;
      case 'coach':
        badgeClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        break;
      default:
        badgeClass = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
    
    return (
      <Badge className={`${badgeClass} font-medium`}>
        {role.replace('_', ' ')}
      </Badge>
    );
  };

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
      
      <div className="p-0">
        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{renderRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => handleOpenEditDialog(user)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 mr-1"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        onClick={() => handleDeleteUser(user.id!)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Delete className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    No users found. Click "Add User" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user with the appropriate role.
            </DialogDescription>
          </DialogHeader>
          <UserForm 
            formData={formData}
            handleInputChange={handleInputChange}
            handleRoleChange={handleRoleChange}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information.
            </DialogDescription>
          </DialogHeader>
          <UserForm 
            formData={formData}
            handleInputChange={handleInputChange}
            handleRoleChange={handleRoleChange}
            isEdit={true}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImportUsersDialog
        isOpen={isImportDialogOpen}
        setIsOpen={setIsImportDialogOpen}
        onImportComplete={fetchUsers}
      />
    </div>
  );
};

export default UserManagement;
