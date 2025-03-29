
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User } from '@/types/auth';

interface UserFormProps {
  formData: User;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRoleChange: (value: 'super_admin' | 'admin' | 'coach') => void;
  isEdit?: boolean;
}

export const UserForm = ({ formData, handleInputChange, handleRoleChange, isEdit = false }: UserFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="space-y-4 py-2 pb-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          value={formData.username || ''}
          onChange={handleInputChange}
          disabled={isEdit} // Username cannot be changed once created
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password {isEdit && "(Leave blank to keep unchanged)"}</Label>
        <div className="flex space-x-2">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password || ''}
            onChange={handleInputChange}
            required={!isEdit}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="px-3 py-2 text-xs bg-secondary text-secondary-foreground rounded-md"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {!isEdit && (
          <p className="text-xs text-muted-foreground mt-1">
            Password must be at least 6 characters
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label>Role</Label>
        <RadioGroup 
          value={formData.role} 
          onValueChange={(value) => handleRoleChange(value as 'super_admin' | 'admin' | 'coach')}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="coach" id="coach" />
            <Label htmlFor="coach" className="cursor-pointer">Coach</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="admin" id="admin" />
            <Label htmlFor="admin" className="cursor-pointer">Admin</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="super_admin" id="super_admin" />
            <Label htmlFor="super_admin" className="cursor-pointer">Super Admin</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};
