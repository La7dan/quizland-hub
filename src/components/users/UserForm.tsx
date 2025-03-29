
import React from 'react';
import { User } from '@/services/userService';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserFormProps {
  formData: User;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRoleChange: (value: string) => void;
  isEdit?: boolean;
}

export const UserForm = ({ formData, handleInputChange, handleRoleChange, isEdit = false }: UserFormProps) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <label htmlFor={isEdit ? "edit-username" : "username"} className="text-sm font-medium">
          Username
        </label>
        <Input
          id={isEdit ? "edit-username" : "username"}
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="Enter username"
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor={isEdit ? "edit-email" : "email"} className="text-sm font-medium">
          Email
        </label>
        <Input
          id={isEdit ? "edit-email" : "email"}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter email"
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor={isEdit ? "edit-password" : "password"} className="text-sm font-medium">
          {isEdit ? "Password (Leave empty to keep current)" : "Password"}
        </label>
        <Input
          id={isEdit ? "edit-password" : "password"}
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder={isEdit ? "Enter new password" : "Enter password"}
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor={isEdit ? "edit-role" : "role"} className="text-sm font-medium">
          Role
        </label>
        <Select
          value={formData.role || "admin"} 
          onValueChange={handleRoleChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="coach">Coach</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
