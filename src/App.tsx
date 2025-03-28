
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute';
import TabIcon from './components/TabIcon';
import Index from "./pages/Index";
import QuizPage from "./pages/QuizPage"; 
import QuizzesPage from "./pages/QuizzesPage";
import LoginPage from "./pages/LoginPage";
import AdminPanel from "./pages/AdminPanel";
import CoachDashboard from "./pages/CoachDashboard";
import NotFound from "./pages/NotFound";
import QuizPreviewPage from "./pages/QuizPreviewPage";

const App: React.FC = () => {
  return (
    <>
      <TabIcon />
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/quizzes" element={<QuizzesPage />} />
        <Route path="/quiz/:id" element={<QuizPage />} />
        <Route path="/quiz/preview/:id" element={<QuizPreviewPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireSuperAdmin>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/coach" 
          element={
            <ProtectedRoute>
              <CoachDashboard />
            </ProtectedRoute>
          } 
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
