
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { executeSql } from '@/services/apiService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EvaluationUploadFormData } from './types';
import { getSelectedMemberCode } from './utils';
import { ENV } from '@/config/env';

const API_BASE_URL = ENV.API_BASE_URL.replace('/api', '');

interface EvaluationUploadTabProps {
  onUploadSuccess: () => void;
}

const EvaluationUploadTab: React.FC<EvaluationUploadTabProps> = ({ onUploadSuccess }) => {
  const [formData, setFormData] = useState<EvaluationUploadFormData>({
    selectedMemberId: '',
    evaluationDate: '',
    pdfFile: null,
  });
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [coachFilter, setCoachFilter] = useState<string>('');
  const { toast } = useToast();

  // Get members without pending evaluations
  const { data: membersData } = useQuery({
    queryKey: ['members-dropdown', searchTerm, levelFilter, coachFilter],
    queryFn: async () => {
      let query = `
        SELECT m.id, m.name, m.member_id, 
               l.name AS member_level,
               u.id as coach_id, u.username as coach_name
        FROM members m
        LEFT JOIN quiz_levels l ON m.level_id = l.id
        LEFT JOIN users u ON m.coach_id = u.id
        WHERE NOT EXISTS (
          SELECT 1 FROM evaluations e 
          WHERE e.member_id = m.id AND e.status = 'pending'
        )
      `;
      
      // Add filters to the query
      if (searchTerm) {
        query += ` AND (m.name ILIKE '%${searchTerm}%' OR m.member_id ILIKE '%${searchTerm}%')`;
      }
      
      if (levelFilter) {
        query += ` AND l.name = '${levelFilter}'`;
      }
      
      if (coachFilter) {
        query += ` AND m.coach_id = ${coachFilter}`;
      }
      
      query += ` ORDER BY m.name`;
      
      console.log("Executing members query:", query);
      const result = await executeSql(query);
      console.log("Members data result:", result);
      return result.rows || [];
    }
  });

  // Get available levels
  const { data: levelsData } = useQuery({
    queryKey: ['member-levels'],
    queryFn: async () => {
      const result = await executeSql(`
        SELECT DISTINCT l.name 
        FROM members m
        JOIN quiz_levels l ON m.level_id = l.id
        WHERE l.name IS NOT NULL 
        ORDER BY l.name
      `);
      return result.rows || [];
    }
  });

  // Get coaches
  const { data: coachesData } = useQuery({
    queryKey: ['coaches'],
    queryFn: async () => {
      const result = await executeSql(`
        SELECT id, username FROM users 
        WHERE role = 'coach' OR role = 'admin' OR role = 'super_admin'
        ORDER BY username
      `);
      return result.rows || [];
    }
  });

  const handleUpload = async () => {
    const { selectedMemberId, evaluationDate, pdfFile } = formData;
    
    if (!selectedMemberId || !evaluationDate || !pdfFile) {
      toast({
        title: "Error",
        description: "Please select a member, evaluation date, and PDF file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      const memberCode = getSelectedMemberCode(selectedMemberId, membersData);
      if (!memberCode) {
        throw new Error("Could not retrieve member code");
      }
      
      const formattedDate = evaluationDate.replace(/\//g, '-');
      
      // Generate a unique filename to support multiple PDFs for the same member
      const timestamp = new Date().getTime();
      const uploadFormData = new FormData();
      uploadFormData.append('file', pdfFile);
      uploadFormData.append('memberCode', memberCode);
      uploadFormData.append('evaluationDate', formattedDate);
      uploadFormData.append('timestamp', timestamp.toString());
      
      setUploadProgress(30);
      
      const uploadResponse = await fetch(`${API_BASE_URL}/api/evaluations/upload-file`, {
        method: 'POST',
        body: uploadFormData,
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || "Failed to upload file");
      }
      
      setUploadProgress(70);
      
      const uploadResult = await uploadResponse.json();
      
      // Check if member already has a pending evaluation
      const checkResult = await executeSql(`
        SELECT COUNT(*) as count FROM evaluations 
        WHERE member_id = ${selectedMemberId} AND status = 'pending'
      `);
      
      if (checkResult.rows[0].count > 0) {
        throw new Error("This member already has a pending evaluation");
      }
      
      // Create a new evaluation record with the PDF file
      const result = await executeSql(`
        INSERT INTO evaluations (member_id, status, nominated_at, evaluation_date, evaluation_pdf, coach_id)
        VALUES (
          ${selectedMemberId}, 
          'pending', 
          NOW(), 
          '${evaluationDate}', 
          '${uploadResult.filePath}', 
          (SELECT id FROM users WHERE role = 'coach' LIMIT 1)
        )
        RETURNING id
      `);

      setUploadProgress(100);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Evaluation uploaded successfully",
        });
        
        setFormData({
          selectedMemberId: '',
          evaluationDate: '',
          pdfFile: null,
        });
        setUploadProgress(0);
        
        onUploadSuccess();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload evaluation",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      setFormData(prev => ({ ...prev, pdfFile: file }));
    }
  };

  // Add filter section for members
  const memberFilterSection = (
    <div className="mb-6 bg-muted/50 p-4 rounded-lg">
      <h3 className="text-sm font-medium mb-3">Filter Members</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_levels">All Levels</SelectItem>
            {levelsData?.map((level: any) => (
              <SelectItem key={level.name} value={level.name}>
                {level.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={coachFilter} onValueChange={setCoachFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Coach" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_coaches">All Coaches</SelectItem>
            {coachesData?.map((coach: any) => (
              <SelectItem key={coach.id} value={coach.id.toString()}>
                {coach.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {(searchTerm || levelFilter || coachFilter) && (
        <div className="mt-2 flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setSearchTerm('');
              setLevelFilter('');
              setCoachFilter('');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {memberFilterSection}
      
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="member" className="text-right">
            Member
          </Label>
          <Select 
            value={formData.selectedMemberId} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, selectedMemberId: value }))}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a member" />
            </SelectTrigger>
            <SelectContent>
              {membersData?.length > 0 ? (
                membersData.map((member: any) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.name} ({member.member_id}) 
                    {member.member_level ? ` - ${member.member_level}` : ''} 
                    {member.coach_name ? ` - Coach: ${member.coach_name}` : ''}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no_members" disabled>
                  No eligible members found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="evaluationDate" className="text-right">
            Evaluation Date
          </Label>
          <Input
            id="evaluationDate"
            type="date"
            value={formData.evaluationDate}
            onChange={(e) => setFormData(prev => ({ ...prev, evaluationDate: e.target.value }))}
            className="col-span-3"
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="pdf" className="text-right">
            PDF Document
          </Label>
          <div className="col-span-3">
            <Input
              id="pdf"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
            {formData.pdfFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {formData.pdfFile.name}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {isUploading && (
        <div className="w-full bg-muted rounded-full h-2.5 my-4">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Uploading: {uploadProgress}%
          </p>
        </div>
      )}
      
      <div className="flex justify-end">
        <Button 
          onClick={handleUpload} 
          className="gap-2"
          disabled={isUploading || !formData.selectedMemberId || !formData.evaluationDate || !formData.pdfFile}
        >
          <UploadCloud className="h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload Evaluation'}
        </Button>
      </div>
      
      {membersData?.length === 0 && (
        <div className="rounded-lg bg-yellow-50 p-4 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">No eligible members</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>All members already have pending evaluations. Complete or delete existing evaluations before creating new ones.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationUploadTab;
