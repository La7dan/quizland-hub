
export interface Member {
  id: number;
  member_id: string;
  name: string;
  level_id: number;
  level_name: string;
  level_code: string;
  classes_count: number;
  evaluation_date?: string;
  evaluation_pdf?: string;
  evaluation_status?: string;
}

export type SortField = 'name' | 'member_id' | 'level_code' | 'classes_count' | 'evaluation_date';
export type SortOrder = 'asc' | 'desc';

export interface MembersSectionProps {
  coachId: number;
}
