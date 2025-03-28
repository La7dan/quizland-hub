
import React from 'react';
import type { User } from '@/contexts/AuthContext';
import { CalendarClock, CheckCircle, FileText } from 'lucide-react';

interface CoachDashboardHeaderProps {
  user: User;
  pendingCount?: number;
}

const CoachDashboardHeader: React.FC<CoachDashboardHeaderProps> = ({ user, pendingCount = 0 }) => {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-secondary/30 p-6 rounded-lg border border-primary/20 shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Coach Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.username}. Review and approve member evaluations.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 bg-background/80 px-4 py-2 rounded-md shadow-sm border">
            <CalendarClock className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-md shadow-sm border border-amber-200">
            <FileText className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              {pendingCount} Pending {pendingCount === 1 ? 'Evaluation' : 'Evaluations'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboardHeader;
