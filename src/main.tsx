
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import App from './App.tsx'
import './index.css'
import { logEnvironment } from './config/env'

// Log environment configuration
logEnvironment();

// Create a QueryClient
const queryClient = new QueryClient()

// Find the root element
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Create a root
const root = createRoot(rootElement);

// Render your app with all required providers
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
