
import React from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MemberSearch } from './members/MemberSearch';
import { MembersList } from './members/MembersList';
import { useMembers } from './members/useMembers';
import { MembersSectionProps } from './members/types';

const MembersSection: React.FC<MembersSectionProps> = ({ coachId }) => {
  const { 
    searchTerm, 
    setSearchTerm, 
    sortField, 
    sortOrder, 
    levelFilter, 
    setLevelFilter, 
    filteredMembers, 
    isLoading, 
    levels, 
    handleSort 
  } = useMembers(coachId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Members</CardTitle>
        <CardDescription>
          View and manage members assigned to you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <MemberSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            levelFilter={levelFilter}
            onLevelFilterChange={setLevelFilter}
            levels={levels || []}
          />
          
          <MembersList
            members={filteredMembers || []}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            isLoading={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MembersSection;
