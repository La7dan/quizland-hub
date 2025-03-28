
export interface EvaluationDisplayItem {
  id: number;
  member_id?: number;
  status: string;
  nominated_at: string;
  evaluation_date?: string;
  evaluation_pdf?: string;
  evaluation_result?: string;
  member_name: string;
  member_code: string;
  coach_id?: number;
  member_level?: string;
  coach_name?: string;
}
