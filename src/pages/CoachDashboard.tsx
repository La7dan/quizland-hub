
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import CoachDashboardHeader from '@/components/coach/CoachDashboardHeader';
import EvaluationsCard from '@/components/coach/EvaluationsCard';
import MembersSection from '@/components/coach/MembersSection';
import { fetchPendingEvaluations } from '@/services/evaluations'; // Updated import path
// Import User type from AuthContext instead of userService
import type { User as AuthUser } from '@/contexts/AuthContext';

const CoachDashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('evaluations'); // 'evaluations' or 'members'

  // Fetch pending evaluations
  const { data, isLoading, error } = useQuery({
    queryKey: ['pendingEvaluations', user?.id],
    queryFn: () => user?.id ? fetchPendingEvaluations(user.id) : Promise.resolve({ success: false, evaluations: [] }),
    enabled: !!user?.id && isAuthenticated && user.role === 'coach'
  });

  // Get the pending evaluations count
  const pendingCount = data?.evaluations?.length || 0;

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
          <CoachDashboardHeader user={user as AuthUser} pendingCount={pendingCount} />
          
          {/* Navigation tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'evaluations' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('evaluations')}
            >
              Evaluations
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'members' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('members')}
            >
              My Members
            </button>
          </div>
          
          {activeTab === 'evaluations' ? (
            <EvaluationsCard 
              isLoading={isLoading}
              error={error as Error | null}
              evaluations={data?.evaluations}
              coachId={user?.id!}
            />
          ) : (
            <MembersSection coachId={user?.id!} />
          )}
        </div>
      </div>
    </>
  );
};

export default CoachDashboard;
