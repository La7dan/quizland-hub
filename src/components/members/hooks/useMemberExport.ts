
import { useQuery } from '@tanstack/react-query';
import { getMembers } from '@/services/members/memberService';
import { format } from 'date-fns';

export const useMemberExport = () => {
  const { data } = useQuery({
    queryKey: ['members'],
    queryFn: getMembers
  });

  const exportMembersToCSV = () => {
    const members = data?.members || [];
    
    if (members.length === 0) {
      console.log('No members to export');
      return;
    }
    
    // Define the headers
    const headers = [
      'Member ID',
      'Name',
      'Level Code',
      'Level Name',
      'Classes Count',
      'Coach',
      'Evaluation Date'
    ];
    
    // Map the data
    const csvData = members.map((member) => [
      member.member_id || '',
      member.name || '',
      member.level_code || '',
      member.level_name || '',
      member.classes_count?.toString() || '0',
      member.coach_name || '',
      member.evaluation_date ? format(new Date(member.evaluation_date), 'yyyy-MM-dd') : ''
    ]);
    
    // Combine headers and data
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `members_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return { exportMembersToCSV };
};
