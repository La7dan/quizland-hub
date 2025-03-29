
import React from 'react';
import { Member } from '@/services/members/memberService';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CircleDot } from 'lucide-react';
import { format } from 'date-fns';

interface MemberRowProps {
  member: Member;
  isSelected: boolean;
  toggleSelection: () => void;
  isDuplicate?: boolean;
}

export const MemberRow: React.FC<MemberRowProps> = ({
  member,
  isSelected,
  toggleSelection,
  isDuplicate = false
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not evaluated';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  return (
    <TableRow className={isSelected ? "bg-muted/50" : ""}>
      <TableCell>
        <Checkbox 
          checked={isSelected}
          onCheckedChange={toggleSelection}
          aria-label={`Select ${member.name}`}
        />
      </TableCell>
      <TableCell className="font-medium flex items-center space-x-1">
        {member.member_id}
        {isDuplicate && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <CircleDot className="h-4 w-4 text-blue-500 ml-1" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Duplicate member ID</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </TableCell>
      <TableCell>{member.name}</TableCell>
      <TableCell>
        {member.level_code ? (
          <Badge variant="outline" className="bg-blue-50">
            {member.level_code} - {member.level_name}
          </Badge>
        ) : (
          <span className="text-gray-400">Not assigned</span>
        )}
      </TableCell>
      <TableCell>{member.classes_count || 0}</TableCell>
      <TableCell>
        {member.coach_name || <span className="text-gray-400">Not assigned</span>}
      </TableCell>
      <TableCell>
        {formatDate(member.evaluation_date)}
      </TableCell>
    </TableRow>
  );
};
