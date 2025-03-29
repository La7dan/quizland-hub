
import { MemberResponse } from '@/services/members/memberService';

export const useMemberExport = () => {
  const exportMembersToCSV = (membersData?: MemberResponse) => {
    if (!membersData?.members || membersData.members.length === 0) {
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
      'Coach'
    ];
    
    // Map the data
    const csvData = membersData.members.map((member) => [
      member.member_id || '',
      member.name || '',
      member.level_code || '',
      member.level_name || '',
      member.classes_count?.toString() || '0',
      member.coach_name || ''
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
  };

  return { exportMembersToCSV };
};
