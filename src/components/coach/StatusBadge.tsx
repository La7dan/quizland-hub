
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
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
