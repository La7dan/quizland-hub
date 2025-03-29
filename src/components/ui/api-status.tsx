
import React, { useEffect, useState } from 'react';
import { AlertCircle, ServerOff, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { checkConnection } from '@/services/api/connectionService';

export function ApiStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [message, setMessage] = useState('Checking connection to the server...');
  const [isChecking, setIsChecking] = useState(false);

  const checkServerStatus = async () => {
    try {
      setIsChecking(true);
      const result = await checkConnection();
      
      if (result.success) {
        setStatus('connected');
        setMessage('Connected to the database server successfully.');
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

  useEffect(() => {
    checkServerStatus();
  }, []);

  if (status === 'connected') return null;

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
              onClick={checkServerStatus} 
              disabled={isChecking}
              className="mt-2"
            >
              {isChecking ? 'Checking...' : 'Retry Connection'}
            </Button>
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}
