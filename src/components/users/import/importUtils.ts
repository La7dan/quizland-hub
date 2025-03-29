
import * as XLSX from 'xlsx';
import { User } from '@/services/userService';

// Function to parse Excel file
export const parseExcelFile = (file: File): Promise<{
  users: User[],
  validCount: number,
  invalidCount: number,
  errors: string[]
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const excelData = XLSX.utils.sheet_to_json(worksheet);
        
        if (excelData.length === 0) {
          resolve({ 
            users: [], 
            validCount: 0, 
            invalidCount: 0, 
            errors: ['Excel file is empty or has no valid data'] 
          });
          return;
        }
        
        // Process users from Excel data
        const users: User[] = [];
        const errors: string[] = [];
        let invalidCount = 0;
        
        for (const row of excelData) {
          const rowData = row as Record<string, any>;
          
          // Check for required fields
          if (!rowData.username || !rowData.email || !rowData.password) {
            errors.push(`Row missing required field(s): ${JSON.stringify(rowData)}`);
            invalidCount++;
            continue;
          }
          
          // Validate role
          const role = String(rowData.role || 'coach').toLowerCase();
          const validRole = ['coach', 'admin', 'super_admin'].includes(role) 
            ? role as 'coach' | 'admin' | 'super_admin'
            : 'coach';
          
          // Create user object
          const user: User = {
            username: String(rowData.username),
            email: String(rowData.email),
            password: String(rowData.password),
            role: validRole
          };
          
          users.push(user);
        }
        
        resolve({
          users,
          validCount: users.length,
          invalidCount,
          errors
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };
    
    reader.readAsBinaryString(file);
  });
};

// Generate sample Excel file
export const generateSampleExcel = (): void => {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const wsData = [
    ['username', 'email', 'password', 'role'],
    ['john_coach', 'john@example.com', 'password123', 'coach'],
    ['jane_admin', 'jane@example.com', 'password123', 'admin'],
    ['super_user', 'super@example.com', 'password123', 'super_admin']
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Users');
  
  // Generate Excel file and download
  XLSX.writeFile(wb, 'sample_users.xlsx');
};
