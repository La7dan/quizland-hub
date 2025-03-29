
import { User } from '@/services/userService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Delete } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface UserListProps {
  users: User[];
  loading: boolean;
  selectedUsers: number[];
  toggleUserSelection: (userId: number) => void;
  toggleSelectAll: () => void;
  handleOpenEditDialog: (user: User) => void;
  handleDeleteUser: (userId: number) => void;
}

export const UserList = ({ 
  users, 
  loading, 
  selectedUsers,
  toggleUserSelection,
  toggleSelectAll,
  handleOpenEditDialog, 
  handleDeleteUser 
}: UserListProps) => {
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

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={users.length > 0 && selectedUsers.length === users.length}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all users"
              />
            </TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id} className={selectedUsers.includes(user.id || -1) ? "bg-muted/50" : ""}>
                <TableCell>
                  <Checkbox 
                    checked={selectedUsers.includes(user.id || -1)}
                    onCheckedChange={() => toggleUserSelection(user.id || -1)}
                    aria-label={`Select ${user.username}`}
                  />
                </TableCell>
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Delete className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete user "{user.username}"? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => user.id && handleDeleteUser(user.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                No users found. Click "Add User" to create one.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
