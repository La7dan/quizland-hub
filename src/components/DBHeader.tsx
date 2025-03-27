
import { useState, useEffect } from 'react';
import { checkConnection } from '@/services/dbService';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Database, ServerOff } from 'lucide-react';

interface DBHeaderProps {
  onOpenCreateTable: () => void;
  onOpenSQLDialog: () => void;
}

const DBHeader = ({ onOpenCreateTable, onOpenSQLDialog }: DBHeaderProps) => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [statusMessage, setStatusMessage] = useState('Checking connection...');

  const checkDatabaseConnection = async () => {
    setConnectionStatus('checking');
    setStatusMessage('Checking connection...');
    
    try {
      const result = await checkConnection();
      if (result.success) {
        setConnectionStatus('connected');
        setStatusMessage('Connected to database');
      } else {
        setConnectionStatus('disconnected');
        setStatusMessage(`Connection failed: ${result.message}`);
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      setStatusMessage('Connection error');
      console.error('Connection check failed:', error);
    }
  };

  useEffect(() => {
    checkDatabaseConnection();
    
    // Check connection status every 30 seconds
    const intervalId = setInterval(checkDatabaseConnection, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

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
          <button 
            onClick={checkDatabaseConnection}
            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded-md transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mt-2">
        {statusMessage}
      </p>
      
      <div className="grid grid-cols-4 gap-4 mt-4 text-xs text-gray-700">
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
