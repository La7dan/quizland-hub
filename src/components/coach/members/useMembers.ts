
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { executeSql } from '@/services/apiService';
import { Member, SortField, SortOrder } from './types';

export const useMembers = (coachId: number) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  // Fetch members for this coach
  const { data: membersData, isLoading } = useQuery({
    queryKey: ['coachMembers', coachId, sortField, sortOrder, levelFilter],
    queryFn: async () => {
      // Base query to get members with their level info and latest evaluation
      let query = `
        SELECT m.id, m.member_id, m.name, m.classes_count, m.level_id,
               l.name AS level_name, l.code AS level_code,
               e.evaluation_date, e.evaluation_pdf, e.status AS evaluation_status
        FROM members m
        LEFT JOIN quiz_levels l ON m.level_id = l.id
        LEFT JOIN LATERAL (
          SELECT e.evaluation_date, e.evaluation_pdf, e.status
          FROM evaluations e
          WHERE e.member_id = m.id
          ORDER BY e.evaluation_date DESC NULLS LAST
          LIMIT 1
        ) e ON true
        WHERE m.coach_id = ${coachId}
      `;
      
      // Add level filter if selected
      if (levelFilter !== 'all') {
        query += ` AND l.id = ${levelFilter}`;
      }
      
      // Add sorting
      query += ` ORDER BY ${sortField} ${sortOrder}`;
      
      const result = await executeSql(query);
      return result.rows || [];
    }
  });

  // Fetch levels for filter dropdown
  const { data: levels } = useQuery({
    queryKey: ['levels'],
    queryFn: async () => {
      const query = `
        SELECT id, name, code FROM quiz_levels ORDER BY code
      `;
      const result = await executeSql(query);
      return result.rows || [];
    }
  });

  // Filter members based on search term
  const filteredMembers = membersData?.filter((member: Member) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      member.name?.toLowerCase().includes(searchLower) ||
      member.member_id?.toLowerCase().includes(searchLower) ||
      member.level_code?.toLowerCase().includes(searchLower)
    );
  });

  // Handle sort change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return {
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
  };
};
