
export interface EvaluationDisplayItem {
  id: number;
  member_id?: number;
  status: 'pending' | 'approved' | 'disapproved'; // Updated to match the Evaluation type
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

// Add the missing type for the form data
export interface EvaluationUploadFormData {
  selectedMemberId: string;
  evaluationDate: string;
  pdfFile: File | null;
}
