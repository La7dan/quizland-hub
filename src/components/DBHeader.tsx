import { useState, useEffect, useRef } from 'react';
import { checkConnection } from '@/services/apiService';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Database, ServerOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DBHeaderProps {
  onOpenCreateTable: () => void;
  onOpenSQLDialog: () => void;
}

const DBHeader = ({ onOpenCreateTable, onOpenSQLDialog }: DBHeaderProps) => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [statusMessage, setStatusMessage] = useState('Checking connection...');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<number>(0);
  
  const MIN_CHECK_INTERVAL = 5 * 60 * 1000; // Increase to 5 minutes
  
  const checkDatabaseConnection = async (force = false) => {
    // Skip check if already connected and not forced
    if (!force && connectionStatus === 'connected') {
      console.log("Skipping connection check - already connected");
      return;
    }
    
    const now = Date.now();
    
    if (!force && now - lastCheckRef.current < MIN_CHECK_INTERVAL) {
      console.log("Skipping connection check - checked recently");
      return;
    }
    
    lastCheckRef.current = now;
    setConnectionStatus('checking');
    setStatusMessage('Checking connection...');
    setIsRefreshing(true);
    
    try {
      console.log("Performing connection check from UI...");
      const result = await checkConnection();
      if (result.success) {
        setConnectionStatus('connected');
        // Handle the case where cached property might not exist
        setStatusMessage(result.cached 
          ? 'Connected to database (cached status)' 
          : 'Connected to database');
          
        // Clear interval if connected successfully
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      } else {
        setConnectionStatus('disconnected');
        setStatusMessage(`Unable to connect to database server`);
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      setStatusMessage('Database server is not responding');
      console.error('Connection check failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial check on component mount with a slight delay
    const initialCheckTimeout = setTimeout(() => {
      checkDatabaseConnection(true);
    }, 2000);
    
    // Only set up periodic checks if not yet connected
    if (connectionStatus !== 'connected') {
      checkIntervalRef.current = setInterval(() => {
        // Only perform periodic checks if disconnected or checking
        if (connectionStatus !== 'connected') {
          checkDatabaseConnection();
        } else if (checkIntervalRef.current) {
          // Clear interval if we're connected
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      }, MIN_CHECK_INTERVAL);
    }
    
    return () => {
      clearTimeout(initialCheckTimeout);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [connectionStatus]);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {connectionStatus === 'connected' ? (
            <Database className="h-6 w-6 text-blue-600" />
          ) : connectionStatus === 'disconnected' ? (
            <ServerOff className="h-6 w-6 text-red-600" />
          ) : (
            <AlertCircle className="h-6 w-6 text-yellow-600 animate-pulse" />
          )}
          <h1 className="text-xl font-semibold">Database Manager</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status:</span>
          {connectionStatus === 'connected' ? (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              Connected
            </Badge>
          ) : connectionStatus === 'disconnected' ? (
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
              Disconnected
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              Checking...
            </Badge>
          )}
          <Button 
            onClick={() => checkDatabaseConnection(true)}
            size="sm"
            variant="outline"
            className="text-xs flex items-center gap-1"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            Refresh
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mt-2">
        {statusMessage}
        {connectionStatus === 'disconnected' && (
          <span className="text-xs block mt-1 text-red-600">
            Make sure the server is running. Launch it with <code className="bg-gray-100 px-1">node server.js</code> command.
          </span>
        )}
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 mt-4 text-xs text-gray-700">
        <div className="bg-gray-50 p-2 rounded">
          <span className="font-medium">Host:</span> 209.74.89.41
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <span className="font-medium">Database:</span> quiz
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <span className="font-medium">User:</span> quiz
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <span className="font-medium">Port:</span> 5432
        </div>
      </div>
    </div>
  );
};

export default DBHeader;
