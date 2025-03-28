
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, LogIn, Lock } from 'lucide-react';
import { LoginFormData } from '@/hooks/useLoginForm';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface LoginFormProps {
  register: UseFormRegister<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
  loginError: string | null;
  lockoutTime: number | null;
  isLoggingIn: boolean;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}

const LoginForm: React.FC<LoginFormProps> = ({
  register,
  errors,
  loginError,
  lockoutTime,
  isLoggingIn,
  rememberMe,
  setRememberMe,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {loginError && lockoutTime === null && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
      )}
      
      {lockoutTime !== null && (
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Account is temporarily locked. Please try again in {lockoutTime} seconds.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm sm:text-base">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="Enter your username"
          className="h-9 sm:h-10 text-sm sm:text-base"
          {...register("username", { required: true })}
          disabled={lockoutTime !== null}
        />
        {errors.username && (
          <p className="text-xs sm:text-sm text-red-500">Username is required</p>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          className="h-9 sm:h-10 text-sm sm:text-base"
          {...register("password", { required: true })}
          disabled={lockoutTime !== null}
        />
        {errors.password && (
          <p className="text-xs sm:text-sm text-red-500">Password is required</p>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="rememberMe" 
          checked={rememberMe} 
          onCheckedChange={(checked) => {
            setRememberMe(checked === true);
          }}
          disabled={lockoutTime !== null}
        />
        <Label 
          htmlFor="rememberMe" 
          className="text-sm cursor-pointer select-none"
        >
          Remember me for 30 days
        </Label>
      </div>
      
      <Button 
        type="submit" 
        className="w-full mt-2" 
        disabled={isLoggingIn || lockoutTime !== null}
      >
        {isLoggingIn ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            Logging in...
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </>
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
