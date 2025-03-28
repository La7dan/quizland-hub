
export interface EvaluationDisplayItem {
  id: number;
  member_name: string;
  member_code: string;
  status: 'pending' | 'approved' | 'disapproved';
  nominated_at: string;
  evaluation_date: string | null;
  evaluation_pdf: string | null;
}

export interface EvaluationUploadFormData {
  selectedMemberId: string;
  evaluationDate: string;
  pdfFile: File | null;
}
