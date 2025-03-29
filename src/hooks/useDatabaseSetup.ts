import { useEffect } from 'react';
import { initializeUserTables } from '@/services/userService';

// Add the logic to clean up admin accounts on initialization
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

        // Set up test coach account
        const setupResult = await fetch('http://209.74.89.41:8080/api/users/setup/setup-test-accounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (setupResult.ok) {
          const data = await setupResult.json();
          if (data.success) {
            console.log('Test accounts set up successfully');
          } else {
            console.error('Failed to set up test accounts:', data.message);
          }
        } else {
          console.error('Failed to set up test accounts - server error');
        }
        
      } catch (error) {
        console.error('Database initialization error:', error);
      }
    };

    initializeDatabase();
  }, []);
};
