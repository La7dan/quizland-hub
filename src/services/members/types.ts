
export interface Member {
  id?: number;
  member_id: string;
  name: string;
  level_id?: number;
  level_code?: string;
  level_name?: string;
  classes_count?: number;
  coach_id?: number;
  coach_name?: string;
  created_at?: string;
  evaluation_date?: string;
  evaluation_pdf?: string;
  evaluation_status?: 'pending' | 'approved' | 'rejected';
}

export interface MemberResponse {
  success: boolean;
  members?: Member[];
  message?: string;
}

export interface MemberActionResponse {
  success: boolean;
  id?: number;
  message?: string;
}

export interface MemberImportResponse {
  success: boolean;
  successCount?: number;
  errorCount?: number;
  errors?: string[];
  message?: string;
}

export interface EvaluationUploadResponse {
  success: boolean;
  evaluation_id?: number;
  file_url?: string;
  message?: string;
}
