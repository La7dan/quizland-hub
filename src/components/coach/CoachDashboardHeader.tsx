
import React from 'react';
import { User } from '@/services/userService';

interface CoachDashboardHeaderProps {
  user: User;
}

const CoachDashboardHeader: React.FC<CoachDashboardHeaderProps> = ({ user }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Coach Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome back, {user.username}. Review and approve member evaluations.
      </p>
    </div>
  );
};

export default CoachDashboardHeader;
