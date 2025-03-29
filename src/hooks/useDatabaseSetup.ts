
import { useEffect } from 'react';
import { initializeUserTables } from '@/services/userService';

export const useDatabaseSetup = () => {
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Initialize user tables
        const tableResult = await initializeUserTables();
        if (tableResult.success) {
          console.log('Database tables initialized successfully');
        } else {
          console.error('Failed to initialize database tables:', tableResult.message);
        }

        // Clean up any admin accounts
        await fetch('http://209.74.89.41:8080/api/users/setup/cleanup-admin-accounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
      } catch (error) {
        console.error('Database initialization error:', error);
      }
    };

    initializeDatabase();
  }, []);
};
