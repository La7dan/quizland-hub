
export interface EvaluationDisplayItem {
  id: number;
  status: string;
  nominated_at: string;
  evaluation_date?: string;
  member_name: string;
  member_code: string;
  evaluation_pdf?: string;
  evaluation_result?: 'passed' | 'not_ready';
  member_id?: number;
  coach_id?: number;
}

export interface EvaluationUploadFormData {
  selectedMemberId: string;
  evaluationDate: string;
  pdfFile: File | null;
}
