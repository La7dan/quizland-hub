
export interface EvaluationDisplayItem {
  id: number;
  status: string; 
  nominated_at: string;
  evaluation_date?: string;
  evaluation_pdf?: string;
  member_name: string;
  member_code: string;
}

export interface EvaluationUploadFormData {
  selectedMemberId: string;
  evaluationDate: string;
  pdfFile: File | null;
}
