
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import CoachDashboardHeader from '@/components/coach/CoachDashboardHeader';
import EvaluationsCard from '@/components/coach/EvaluationsCard';
import { fetchPendingEvaluations } from '@/services/evaluations/evaluationService';
// Import User type from AuthContext instead of userService
import type { User as AuthUser } from '@/contexts/AuthContext';

const CoachDashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // Fetch pending evaluations
  const { data, isLoading, error } = useQuery({
    queryKey: ['pendingEvaluations', user?.id],
    queryFn: () => user?.id ? fetchPendingEvaluations(user.id) : Promise.resolve({ success: false, evaluations: [] }),
    enabled: !!user?.id && isAuthenticated && user.role === 'coach'
  });

  // If loading auth, show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If not a coach, redirect to home
  if (user?.role !== 'coach') {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navigation />
      <div className="container py-8">
        <div className="flex flex-col gap-6">
          <CoachDashboardHeader user={user as AuthUser} />
          <EvaluationsCard 
            isLoading={isLoading}
            error={error as Error | null}
            evaluations={data?.evaluations}
            coachId={user?.id!}
          />
        </div>
      </div>
    </>
  );
};

export default CoachDashboard;
