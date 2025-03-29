
import React, { useEffect, useState } from 'react';
import { AlertCircle, ServerOff, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { checkConnection } from '@/services/api/connectionService';
import { ENV } from '@/config/env';

export function ApiStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [message, setMessage] = useState('Checking connection to the server...');
  const [isChecking, setIsChecking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const checkServerStatus = async () => {
    try {
      setIsChecking(true);
      const result = await checkConnection();
      
      if (result.success) {
        setStatus('connected');
        setMessage('Connected to the database server successfully.');
        setRetryCount(0);
      } else {
        setStatus('error');
        setMessage(result.message || 'Unable to connect to the database server.');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unknown connection error');
    } finally {
      setIsChecking(false);
    }
  };

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    await checkServerStatus();
  };

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ENV.CONNECTION_TIMEOUT);
    
    checkServerStatus().finally(() => clearTimeout(timeoutId));
    
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  // Don't show anything if connected
  if (status === 'connected') return null;
  
  // Don't show if we've tried too many times
  if (retryCount > ENV.RETRY_ATTEMPTS) {
    return (
      <Alert variant="destructive" className="mb-4">
        <ServerOff className="h-4 w-4" />
        <AlertTitle>Connection Failed</AlertTitle>
        <AlertDescription>
          Unable to connect after multiple attempts. Please check your network connection or try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant={status === 'checking' ? 'default' : 'destructive'} className="mb-4">
      {status === 'checking' ? (
        <AlertCircle className="h-4 w-4 animate-pulse" />
      ) : (
        <ServerOff className="h-4 w-4" />
      )}
      <AlertTitle>
        {status === 'checking' ? 'Checking Connection' : 'Connection Error'}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p>{message}</p>
        {status === 'error' && (
          <>
            <p className="text-xs mt-2">
              This could be due to server maintenance or configuration issues. Please try again later.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry} 
              disabled={isChecking}
              className="mt-2"
            >
              {isChecking ? 'Checking...' : `Retry Connection (${retryCount}/${ENV.RETRY_ATTEMPTS})`}
            </Button>
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}
