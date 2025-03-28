
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Toaster } from 'sonner'
import App from './App.tsx'
import './index.css'
import { logEnvironment, ENV } from './config/env'

// Log environment configuration
logEnvironment();

// Output API URL in development for debugging
if (ENV.DEBUG) {
  console.log('🌐 API URL:', ENV.API_BASE_URL);
  console.log('⚠️ Important: This application requires a backend server to handle API requests.');
  console.log('📋 To run the backend server: node server.js');
  console.log('   - Make sure the server is running at the correct port (default: 8080)');
  console.log('   - The server should be accessible at', ENV.API_BASE_URL);
}

// Create a QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Find the root element
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Create a root
const root = createRoot(rootElement);

// Create a toast to remind users about the backend
const showBackendReminder = () => {
  setTimeout(() => {
    if (ENV.DEBUG) {
      Toaster.custom((t) => (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded shadow-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                This app requires a backend server at <strong>{ENV.API_BASE_URL}</strong>
                <br />
                Run <code className="bg-amber-50 px-1 rounded">node server.js</code> to start it.
              </p>
            </div>
          </div>
        </div>
      ), { duration: 10000 })
    }
  }, 2000)
}

// Render your app with all required providers
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <App />
            <Toaster position="top-right" closeButton />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// Show backend reminder toast
showBackendReminder();
