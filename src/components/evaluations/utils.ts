
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

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) return;
  
  // Convert data to CSV format
  const csvContent = arrayToCSV(data);
  
  // Create a blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper function to convert array to CSV
const arrayToCSV = (data: any[]): string => {
  // Get headers from first object keys
  const headers = Object.keys(data[0]);
  
  // Create header row
  const csvRows = [headers.join(',')];
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle special characters and wrap in quotes if needed
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};
