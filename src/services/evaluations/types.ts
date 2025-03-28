
export interface Evaluation {
  id?: number;
  member_id?: number; // Made optional to match EvaluationDisplayItem
  status: 'pending' | 'approved' | 'disapproved';
  nominated_at: string;
  approved_at?: string;
  disapproved_at?: string;
  disapproval_reason?: string;
  coach_id?: number; // Made optional for consistency
  evaluation_pdf?: string;
  evaluation_date?: string;
  evaluation_result?: 'passed' | 'not_ready';
  updated_at?: string;
  // Additional properties from the joined query
  member_name?: string;
  member_code?: string;
}

export interface EvaluationResponse {
  success: boolean;
  evaluations?: Evaluation[];
  message?: string;
}

export interface EvaluationActionResponse {
  success: boolean;
  id?: number;
  message?: string;
}
