
import { useQuery } from '@tanstack/react-query';
import { executeSql } from '@/services/apiService';
import { EvaluationDisplayItem } from '../types';

export const useEvaluationData = (refreshTrigger?: number) => {
  return useQuery({
    queryKey: ['allEvaluations', refreshTrigger],
    queryFn: async () => {
      console.log('Fetching all evaluations...');
      const result = await executeSql(`
        SELECT e.*, 
               m.name as member_name, 
               m.member_id as member_code,
               l.name as member_level,
               u.username as coach_name
        FROM evaluations e
        JOIN members m ON e.member_id = m.id
        LEFT JOIN quiz_levels l ON m.level_id = l.id
        LEFT JOIN users u ON e.coach_id = u.id
        ORDER BY e.nominated_at DESC
      `);
      console.log('Evaluations fetch result:', result);
      return result.rows || [] as EvaluationDisplayItem[];
    }
  });
};

export const useFilterOptions = () => {
  return useQuery({
    queryKey: ['evaluationFilterOptions'],
    queryFn: async () => {
      const coachesResult = await executeSql(`
        SELECT DISTINCT u.id, u.username 
        FROM users u 
        JOIN evaluations e ON u.id = e.coach_id 
        WHERE u.role = 'coach'
        ORDER BY u.username
      `);
      
      const levelsResult = await executeSql(`
        SELECT DISTINCT l.name as level_name
        FROM members m 
        JOIN evaluations e ON m.id = e.member_id
        JOIN quiz_levels l ON m.level_id = l.id
        ORDER BY l.name
      `);
      
      const statusesResult = await executeSql(`
        SELECT DISTINCT status FROM evaluations
      `);
      
      return {
        coaches: coachesResult.rows || [],
        levels: levelsResult.rows.map(row => row.level_name).filter(Boolean) || [],
        statuses: statusesResult.rows.map(row => row.status) || []
      };
    }
  });
};
