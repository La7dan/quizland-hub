import * as XLSX from 'xlsx';
import { Member } from '@/services/members/memberService';

// CSV import functionality
export const parseCSVData = (csvData: string, levelsData: any, coaches: any[]): { members: Member[], error?: string } => {
  try {
    const lines = csvData.trim().split('\n');
    if (lines.length === 0) {
      return { members: [], error: 'CSV data is empty' };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const memberIdIndex = headers.indexOf('member_id');
    const nameIndex = headers.indexOf('name');
    const levelCodeIndex = headers.indexOf('level_code');
    const classesCountIndex = headers.indexOf('classes_count');
    const coachIndex = headers.indexOf('coach');
    
    if (memberIdIndex === -1 || nameIndex === -1) {
      return { 
        members: [], 
        error: 'CSV must include at least member_id and name columns' 
      };
    }
    
    const members: Member[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      
      const member: Member = {
        member_id: values[memberIdIndex],
        name: values[nameIndex]
      };
      
      // Process level code to get level_id
      if (levelCodeIndex !== -1 && values[levelCodeIndex]) {
        const levelCode = values[levelCodeIndex].trim();
        console.log('Looking for level code:', levelCode);
        console.log('Available levels:', levelsData?.levels);
        
        const level = levelsData?.levels?.find((l: any) => 
          l.code.toLowerCase() === levelCode.toLowerCase()
        );
        
        if (level) {
          member.level_id = level.id;
          member.level_code = level.code; // Store for display purposes
          console.log('Found level:', level);
        } else {
          console.log('Level not found for code:', levelCode);
        }
      }
      
      // Process classes count
      if (classesCountIndex !== -1 && values[classesCountIndex]) {
        const classesCount = parseInt(values[classesCountIndex]);
        if (!isNaN(classesCount)) {
          member.classes_count = classesCount;
        }
      }
      
      // Process coach
      if (coachIndex !== -1 && values[coachIndex]) {
        const coachName = values[coachIndex].trim();
        const coach = coaches.find(c => c.username.toLowerCase() === coachName.toLowerCase());
        if (coach) {
          member.coach_id = coach.id;
          member.coach_name = coach.username; // Store for display purposes
        }
      }
      
      members.push(member);
    }
    
    if (members.length === 0) {
      return { members: [], error: 'No valid members found in CSV data' };
    }
    
    return { members };
  } catch (error) {
    return { 
      members: [], 
      error: `Failed to parse CSV data: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

// Define an interface for invalid records
interface InvalidRecord {
  rowData: Record<string, any>;
  reason: string;
}

// Excel import functionality
export const parseExcelFile = (
  file: File, 
  levelsData: any, 
  coaches: any[]
): Promise<{ 
  members: Member[], 
  total: number,
  invalidRecords: InvalidRecord[],
  error?: string 
}> => {
  return new Promise((resolve) => {
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
            members: [], 
            total: 0,
            invalidRecords: [],
            error: 'Excel file is empty or has no valid data' 
          });
          return;
        }
        
        // Process members from Excel data
        const members: Member[] = [];
        const invalidRecords: InvalidRecord[] = [];
        const total = excelData.length;
        
        for (const row of excelData) {
          const rowData = row as Record<string, any>;
          
          // Check for required fields
          if (!rowData.member_id || !rowData.name) {
            invalidRecords.push({
              rowData,
              reason: `Missing required field: ${!rowData.member_id ? 'member_id' : 'name'}`
            });
            continue;
          }
          
          const member: Member = {
            member_id: String(rowData.member_id),
            name: String(rowData.name)
          };
          
          // Match level code if provided
          if (rowData.level_code) {
            const levelCode = String(rowData.level_code).trim();
            console.log('Excel: Looking for level code:', levelCode);
            
            const level = levelsData?.levels?.find((l: any) => 
              l.code.toLowerCase() === levelCode.toLowerCase()
            );
            
            if (level) {
              member.level_id = level.id;
              member.level_code = level.code; // Store for display
              console.log('Excel: Found level:', level);
            } else {
              console.log('Excel: Level not found for code:', levelCode);
              // We still keep the member, but log that level wasn't found
              invalidRecords.push({
                rowData,
                reason: `Level code "${levelCode}" not found in the system`
              });
            }
          }
          
          // Set classes count if provided - ensure it's a number
          if (rowData.classes_count !== undefined) {
            const classesCount = Number(rowData.classes_count);
            if (!isNaN(classesCount)) {
              member.classes_count = classesCount;
            } else {
              // If classes_count isn't a number, note it but continue
              invalidRecords.push({
                rowData,
                reason: `Invalid classes_count: "${rowData.classes_count}" is not a number`
              });
            }
          }
          
          // Match coach if provided
          if (rowData.coach) {
            const coachName = String(rowData.coach).trim();
            const coach = coaches.find(c => c.username.toLowerCase() === coachName.toLowerCase());
            if (coach) {
              member.coach_id = coach.id;
              member.coach_name = coach.username; // Store for display
            } else {
              // Coach not found
              invalidRecords.push({
                rowData,
                reason: `Coach "${coachName}" not found in the system`
              });
            }
          }
          
          members.push(member);
        }
        
        if (members.length === 0) {
          resolve({ 
            members: [], 
            total,
            invalidRecords,
            error: 'No valid members found in Excel data' 
          });
          return;
        }
        
        resolve({ members, total, invalidRecords });
      } catch (error) {
        resolve({ 
          members: [], 
          total: 0,
          invalidRecords: [],
          error: `Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
      }
    };
    
    reader.onerror = () => {
      resolve({ 
        members: [], 
        total: 0,
        invalidRecords: [],
        error: 'Failed to read Excel file' 
      });
    };
    
    reader.readAsBinaryString(file);
  });
};

// Sample data generation
export const generateSampleCSV = (): string => {
  return 'member_id,name,level_code,classes_count,coach\nSH123456,John Smith,B1,10,coach\nSH654321,Jane Doe,I2,15,admin';
};

export const generateSampleExcel = (): void => {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const wsData = [
    ['member_id', 'name', 'level_code', 'classes_count', 'coach'],
    ['SH123456', 'John Smith', 'B1', 10, 'coach'],
    ['SH654321', 'Jane Doe', 'I2', 15, 'admin']
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Members');
  
  // Generate Excel file and download
  XLSX.writeFile(wb, 'sample_members.xlsx');
};

// Download sample CSV
export const downloadSampleCSV = (): void => {
  const sampleData = generateSampleCSV();
  const blob = new Blob([sampleData], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_members.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
