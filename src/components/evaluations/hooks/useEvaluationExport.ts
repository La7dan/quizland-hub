
import { EvaluationDisplayItem } from '../types';

export const useEvaluationExport = () => {
  const exportToCSV = (evaluations: EvaluationDisplayItem[]) => {
    if (!evaluations || evaluations.length === 0) return;
    
    const headers = [
      'Member Name', 
      'Member Code', 
      'Status', 
      'Evaluation Date', 
      'Nominated Date',
      'Result',
      'Has PDF'
    ];
    
    const csvData = evaluations.map((item: EvaluationDisplayItem) => [
      item.member_name,
      item.member_code,
      item.status,
      item.evaluation_date ? new Date(item.evaluation_date).toLocaleDateString() : 'Not set',
      new Date(item.nominated_at).toLocaleDateString(),
      item.evaluation_result || 'Not set',
      item.evaluation_pdf ? 'Yes' : 'No'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `completed_evaluations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { exportToCSV };
};
