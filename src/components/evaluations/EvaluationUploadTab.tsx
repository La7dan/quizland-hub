
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { executeSql } from '@/services/apiService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EvaluationUploadFormData } from './types';
import { getSelectedMemberCode } from './utils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://209.74.89.41:8080';

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
  const { toast } = useToast();

  // Fetch members for the dropdown
  const { data: membersData } = useQuery({
    queryKey: ['members-dropdown'],
    queryFn: async () => {
      const result = await executeSql(`
        SELECT id, name, member_id 
        FROM members 
        ORDER BY name
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
      
      // Get member code (SH number) for file naming
      const memberCode = getSelectedMemberCode(selectedMemberId, membersData);
      if (!memberCode) {
        throw new Error("Could not retrieve member code");
      }
      
      // Create formatted date for filename (YYYY-MM-DD)
      const formattedDate = evaluationDate.replace(/\//g, '-');
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('memberCode', memberCode);
      formData.append('evaluationDate', formattedDate);
      
      setUploadProgress(30);
      
      // Upload file to server
      const uploadResponse = await fetch(`${API_BASE_URL}/api/evaluations/upload-file`, {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || "Failed to upload file");
      }
      
      setUploadProgress(70);
      
      const uploadResult = await uploadResponse.json();
      
      // Now create the evaluation record in the database
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
        
        // Reset form
        setFormData({
          selectedMemberId: '',
          evaluationDate: '',
          pdfFile: null,
        });
        setUploadProgress(0);
        
        // Notify parent to refresh evaluations list
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

  return (
    <div className="space-y-4">
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
              {membersData?.map((member: any) => (
                <SelectItem key={member.id} value={member.id.toString()}>
                  {member.name} ({member.member_id})
                </SelectItem>
              ))}
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
    </div>
  );
};

export default EvaluationUploadTab;
