
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, LogIn, Lock, Bug } from 'lucide-react';
import { LoginFormData } from '@/hooks/useLoginForm';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { debugLogin } from '@/utils/loginDebugger';
import { useToast } from '@/components/ui/use-toast';

interface LoginFormProps {
  register: UseFormRegister<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
  loginError: string | null;
  lockoutTime: number | null;
  isLoggingIn: boolean;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  loginWithAdminCredentials?: () => Promise<void>;
}

const LoginForm: React.FC<LoginFormProps> = ({
  register,
  errors,
  loginError,
  lockoutTime,
  isLoggingIn,
  rememberMe,
  setRememberMe,
  onSubmit,
  loginWithAdminCredentials
}) => {
  const { toast } = useToast();
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [debugResult, setDebugResult] = useState<string | null>(null);
  const [isDebugLoading, setIsDebugLoading] = useState(false);
  
  // Function to handle the debug button click
  const handleDebugLogin = async (event: React.MouseEvent) => {
    event.preventDefault();
    
    // Get the form values
    const form = event.currentTarget.closest('form');
    if (!form) return;
    
    const formData = new FormData(form);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    if (!username || !password) {
      toast({
        title: "Debug Error",
        description: "Username and password are required for debugging",
        variant: "destructive"
      });
      return;
    }
    
    setIsDebugLoading(true);
    
    try {
      const result = await debugLogin(username, password);
      setDebugResult(result);
      toast({
        title: "Login Debug Results",
        description: "Check the debug panel below the form",
      });
    } catch (error) {
      console.error('Debug error:', error);
      setDebugResult(`Error connecting to database: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
      toast({
        title: "Debug Error",
        description: "Could not connect to the database. Is the server running?",
        variant: "destructive"
      });
    } finally {
      setIsDebugLoading(false);
    }
  };
  
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
          name="username"
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
          name="password"
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
      
      {loginWithAdminCredentials && (
        <Button 
          type="button" 
          variant="outline"
          className="w-full py-2 h-11 mt-2"
          onClick={() => loginWithAdminCredentials()}
          disabled={isLoggingIn || lockoutTime !== null}
        >
          <div className="flex items-center justify-center">
            <LogIn className="mr-2 h-5 w-5" />
            <span>Quick Login (admin)</span>
          </div>
        </Button>
      )}
      
      {/* Debug section */}
      <div className="pt-2 border-t mt-4">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setIsDebugMode(!isDebugMode)}
            className="text-xs text-muted-foreground flex items-center"
          >
            <Bug className="h-3 w-3 mr-1" />
            {isDebugMode ? 'Hide Debug' : 'Debug Tools'}
          </button>
          
          {isDebugMode && (
            <Button 
              type="button"
              size="sm"
              variant="outline"
              onClick={handleDebugLogin}
              className="text-xs py-1 h-7"
              disabled={isDebugLoading}
            >
              {isDebugLoading ? (
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  <span>Checking...</span>
                </div>
              ) : (
                'Verify Credentials'
              )}
            </Button>
          )}
        </div>
        
        {isDebugMode && debugResult && (
          <div className="mt-3 text-xs p-2 bg-muted rounded-md whitespace-pre-wrap">
            {debugResult}
          </div>
        )}
      </div>
    </form>
  );
};

export default LoginForm;
