
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
    <form onSubmit={onSubmit} className="space-y-5">
      {loginError && lockoutTime === null && (
        <Alert variant="destructive" className="animate-in fade-in-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
      )}
      
      {lockoutTime !== null && (
        <Alert variant="destructive" className="animate-in fade-in-50">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Account is temporarily locked. Please try again in {lockoutTime} seconds.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium">
          Username
        </Label>
        <Input
          id="username"
          type="text"
          placeholder="Enter your username"
          className="h-10 text-base"
          {...register("username", { required: true })}
          disabled={lockoutTime !== null}
          autoComplete="username"
        />
        {errors.username && (
          <p className="text-sm text-red-500 mt-1">Username is required</p>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          className="h-10 text-base"
          {...register("password", { required: true })}
          disabled={lockoutTime !== null}
          autoComplete="current-password"
        />
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">Password is required</p>
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
        className="w-full py-2 h-11"
        size="lg"
        disabled={isLoggingIn || lockoutTime !== null}
      >
        {isLoggingIn ? (
          <div className="flex items-center justify-center">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            <span>Signing in...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <LogIn className="mr-2 h-5 w-5" />
            <span>Sign in</span>
          </div>
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
