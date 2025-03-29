import { useState } from 'react';
import { User, getUsers, createUser, updateUser, deleteUser, initializeUserTables, createManyUsers } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<User>({
    username: '',
    password: '',
    email: '',
    role: 'coach'
  });
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const { toast } = useToast();

  const setupUserTables = async () => {
    try {
      const result = await initializeUserTables();
      if (!result.success) {
        toast({
          title: "Error",
          description: "Failed to initialize user tables",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error setting up user tables:', error);
      toast({
        title: "Error",
        description: "Failed to initialize user tables",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await getUsers();
      if (result.success) {
        setUsers(result.users);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      role: value as 'super_admin' | 'admin' | 'coach' 
    }));
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
      role: 'coach'
    });
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (user: User) => {
    setCurrentUser(user);
    setFormData({
      ...user,
      password: '' // Don't populate password for security
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenImportDialog = () => {
    setIsImportDialogOpen(true);
  };

  const handleImportUsers = async (users: User[]) => {
    try {
      if (users.length === 0) {
        toast({
          title: "Error",
          description: "No users to import",
          variant: "destructive",
        });
        return;
      }

      const result = await createManyUsers(users);
      if (result.success) {
        toast({
          title: "Success",
          description: `Successfully imported ${result.count || users.length} users`,
        });
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to import users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error importing users:', error);
      toast({
        title: "Error",
        description: "Failed to import users",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async () => {
    try {
      if (!formData.username || !formData.password || !formData.email) {
        toast({
          title: "Error",
          description: "All fields are required",
          variant: "destructive",
        });
        return;
      }

      const result = await createUser(formData);
      if (result.success) {
        toast({
          title: "Success",
          description: "User created successfully",
        });
        fetchUsers();
        setIsAddDialogOpen(false);
        resetForm();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async () => {
    try {
      if (!currentUser || !currentUser.id) {
        toast({
          title: "Error",
          description: "Invalid user data",
          variant: "destructive",
        });
        return;
      }

      if (!formData.username || !formData.email) {
        toast({
          title: "Error",
          description: "Username and email are required",
          variant: "destructive",
        });
        return;
      }

      const userToUpdate: User = {
        ...formData,
        id: currentUser.id
      };

      // If password is empty, don't update it
      if (!formData.password) {
        delete userToUpdate.password;
      }

      const result = await updateUser(userToUpdate);
      if (result.success) {
        toast({
          title: "Success",
          description: "User updated successfully",
        });
        fetchUsers();
        setIsEditDialogOpen(false);
        resetForm();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  return {
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
  };
};
