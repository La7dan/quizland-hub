
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { executeSql } from '@/services/apiService';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Search, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Evaluation {
  id: number;
  member_name: string;
  member_code: string;
  status: 'pending' | 'approved' | 'disapproved';
  nominated_at: string;
  evaluation_date: string | null;
  evaluation_pdf: string | null;
}

interface EvaluationManagementProps {
  onRefresh: () => void;
}

const EvaluationManagement: React.FC<EvaluationManagementProps> = ({ onRefresh }) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [evaluationDate, setEvaluationDate] = useState<string>('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
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

  // Fetch evaluations
  const { data: evaluationsData, isLoading, refetch } = useQuery({
    queryKey: ['evaluations', searchTerm, statusFilter],
    queryFn: async () => {
      let query = `
        SELECT e.id, e.status, e.nominated_at, e.evaluation_date, e.evaluation_pdf,
               m.name as member_name, m.member_id as member_code
        FROM evaluations e
        JOIN members m ON e.member_id = m.id
        WHERE 1=1
      `;
      
      if (searchTerm) {
        query += ` AND (m.name ILIKE '%${searchTerm}%' OR m.member_id ILIKE '%${searchTerm}%')`;
      }
      
      if (statusFilter !== 'all') {
        query += ` AND e.status = '${statusFilter}'`;
      }
      
      query += ` ORDER BY e.nominated_at DESC`;
      
      const result = await executeSql(query);
      return result.rows || [];
    }
  });

  const handleUpload = async () => {
    if (!selectedMemberId || !evaluationDate) {
      toast({
        title: "Error",
        description: "Please select a member and evaluation date",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real implementation, you would upload the PDF file to a server/storage
      // For now, we'll just store the filename
      const pdfFileName = pdfFile ? pdfFile.name : null;
      
      const result = await executeSql(`
        INSERT INTO evaluations (member_id, status, nominated_at, evaluation_date, evaluation_pdf, coach_id)
        VALUES (
          ${selectedMemberId}, 
          'pending', 
          NOW(), 
          '${evaluationDate}', 
          ${pdfFileName ? `'${pdfFileName}'` : 'NULL'}, 
          (SELECT id FROM users WHERE role = 'coach' LIMIT 1)
        )
        RETURNING id
      `);

      if (result.success) {
        toast({
          title: "Success",
          description: "Evaluation uploaded successfully",
        });
        
        // Reset form
        setSelectedMemberId('');
        setEvaluationDate('');
        setPdfFile(null);
        
        // Refresh evaluations list
        refetch();
        onRefresh();
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
      setPdfFile(file);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'disapproved':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Management</CardTitle>
          <CardDescription>Upload and manage member evaluations with PDF documents</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload">
            <TabsList className="mb-4">
              <TabsTrigger value="upload">Upload New Evaluation</TabsTrigger>
              <TabsTrigger value="list">View Evaluations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="member" className="text-right">
                    Member
                  </Label>
                  <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
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
                    value={evaluationDate}
                    onChange={(e) => setEvaluationDate(e.target.value)}
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
                    {pdfFile && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Selected: {pdfFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleUpload} className="gap-2">
                  <UploadCloud className="h-4 w-4" />
                  Upload Evaluation
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="list">
              <div className="flex items-center justify-between space-x-2 pb-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-[250px]"
                  />
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="disapproved">Disapproved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading evaluations...</p>
                </div>
              ) : evaluationsData?.length > 0 ? (
                <div className="border rounded-md">
                  <div className="grid grid-cols-5 gap-4 border-b bg-muted/50 p-4 font-medium">
                    <div>Member</div>
                    <div>Status</div>
                    <div>Evaluation Date</div>
                    <div>Nominated Date</div>
                    <div>Actions</div>
                  </div>
                  <div className="divide-y">
                    {evaluationsData.map((evaluation: Evaluation) => (
                      <div key={evaluation.id} className="grid grid-cols-5 gap-4 p-4 items-center">
                        <div className="font-medium">
                          {evaluation.member_name}
                          <span className="block text-xs text-muted-foreground">
                            {evaluation.member_code}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(evaluation.status)}
                          <span className="capitalize">{evaluation.status}</span>
                        </div>
                        <div>
                          {evaluation.evaluation_date
                            ? new Date(evaluation.evaluation_date).toLocaleDateString()
                            : "Not set"}
                        </div>
                        <div>
                          {new Date(evaluation.nominated_at).toLocaleDateString()}
                        </div>
                        <div className="flex space-x-2">
                          {evaluation.evaluation_pdf && (
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                              <FileText className="h-3 w-3" />
                              <span>View PDF</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg border-muted">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-2 text-lg font-semibold">No evaluations found</h3>
                  <p className="text-muted-foreground mt-1">
                    {searchTerm || statusFilter !== 'all'
                      ? "Try changing your search or filter"
                      : "Upload evaluations to see them here"}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvaluationManagement;
