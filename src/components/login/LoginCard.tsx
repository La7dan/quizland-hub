
import React from 'react';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginLastActivity from './LoginLastActivity';
import LoginForm from './LoginForm';
import { UseFormRegister, FieldErrors, FormEventHandler } from 'react-hook-form';
import { LoginFormData } from '@/hooks/useLoginForm';

interface LoginCardProps {
  lastLogin: { time: string, location: string } | null;
  register: UseFormRegister<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
  loginError: string | null;
  lockoutTime: number | null;
  isLoggingIn: boolean;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

const LoginCard: React.FC<LoginCardProps> = ({
  lastLogin,
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
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl sm:text-2xl flex items-center">
          <Shield className="mr-2 h-5 w-5 text-primary" />
          Login
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Enter your credentials to access the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <LoginLastActivity lastLogin={lastLogin} />
        
        <LoginForm
          register={register}
          errors={errors}
          loginError={loginError}
          lockoutTime={lockoutTime}
          isLoggingIn={isLoggingIn}
          rememberMe={rememberMe}
          setRememberMe={setRememberMe}
          onSubmit={onSubmit}
        />
      </CardContent>
    </Card>
  );
};

export default LoginCard;
