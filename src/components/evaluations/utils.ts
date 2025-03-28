
const API_BASE_URL = 'http://209.74.89.41:8080';

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return 'CheckCircle';
    case 'disapproved':
      return 'XCircle';
    default:
      return 'Clock';
  }
};

export const handleDownload = (filePath: string) => {
  window.open(`${API_BASE_URL}/files/${filePath}`, '_blank');
};

export const getSelectedMemberCode = (
  selectedMemberId: string,
  membersData: any[]
): string => {
  if (!selectedMemberId || !membersData) return '';
  
  const selectedMember = membersData.find(
    (member: any) => member.id.toString() === selectedMemberId
  );
  
  return selectedMember ? selectedMember.member_id : '';
};
