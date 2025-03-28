
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
  hasResult?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, hasResult = false }) => {
  // If there's a result (passed/not ready), show as completed with black text
  if (hasResult) {
    return <Badge className="bg-gray-100 text-black hover:bg-gray-200 border border-gray-300">Completed</Badge>;
  }

  switch (status) {
    case 'approved':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
    case 'disapproved':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Disapproved</Badge>;
    default:
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pending</Badge>;
  }
};

export default StatusBadge;
