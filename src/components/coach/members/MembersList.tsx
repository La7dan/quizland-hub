
import React from 'react';
import { ArrowUp, ArrowDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Member, SortField } from './types';
import { formatDate, handleDownload } from './memberUtils';

interface MembersListProps {
  members: Member[];
  sortField: SortField;
  sortOrder: 'asc' | 'desc';
  onSort: (field: SortField) => void;
  isLoading: boolean;
}

export const MembersList: React.FC<MembersListProps> = ({
  members,
  sortField,
  sortOrder,
  onSort,
  isLoading
}) => {
  // Render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? 
      <ArrowUp className="inline h-4 w-4 ml-1" /> : 
      <ArrowDown className="inline h-4 w-4 ml-1" />;
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading members...</p>
      </div>
    );
  }
  
  if (members?.length === 0) {
    return (
      <div className="py-8 text-center border rounded-md border-dashed">
        <p className="text-muted-foreground">No members found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-muted/50 p-4 font-medium">
        <div className="cursor-pointer" onClick={() => onSort('member_id')}>
          Member ID {renderSortIndicator('member_id')}
        </div>
        <div className="cursor-pointer" onClick={() => onSort('name')}>
          Name {renderSortIndicator('name')}
        </div>
        <div className="cursor-pointer" onClick={() => onSort('level_code')}>
          Level {renderSortIndicator('level_code')}
        </div>
        <div className="cursor-pointer" onClick={() => onSort('classes_count')}>
          Classes {renderSortIndicator('classes_count')}
        </div>
        <div className="cursor-pointer" onClick={() => onSort('evaluation_date')}>
          Evaluation {renderSortIndicator('evaluation_date')}
        </div>
      </div>
      
      <div className="divide-y">
        {members?.map((member: Member) => (
          <div key={member.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 items-center">
            <div className="font-medium">
              {member.member_id}
            </div>
            <div>
              {member.name}
            </div>
            <div>
              {member.level_code ? (
                <Badge variant="outline" className="bg-blue-50">
                  {member.level_code} - {member.level_name}
                </Badge>
              ) : (
                <span className="text-muted-foreground">Not assigned</span>
              )}
            </div>
            <div>
              {member.classes_count}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <span className="text-sm">
                {formatDate(member.evaluation_date)}
              </span>
              {member.evaluation_pdf && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-1"
                  onClick={() => handleDownload(member.evaluation_pdf!)}
                >
                  <Download className="h-3 w-3" />
                  <span>PDF</span>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
