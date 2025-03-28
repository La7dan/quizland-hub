
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
      // Using the correct API for sonner toast
      Toaster.show({
        title: "Backend Server Required",
        description: `This app requires a backend server at ${ENV.API_BASE_URL}. Run "node server.js" to start it.`,
        duration: 10000,
        icon: "⚠️",
        style: { background: "#FEF3C7", color: "#92400E", border: "1px solid #F59E0B" }
      });
    }
  }, 2000);
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
