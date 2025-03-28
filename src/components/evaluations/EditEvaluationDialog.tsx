
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Evaluation } from '@/services/evaluations/types';
import { updateEvaluationResult } from '@/services/evaluations/evaluationService';
import { FileUp } from 'lucide-react';
import { ENV } from '@/config/env';

interface EditEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluation: Evaluation | null;
}

const EditEvaluationDialog: React.FC<EditEvaluationDialogProps> = ({
  open,
  onOpenChange,
  evaluation
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [evaluationResult, setEvaluationResult] = useState<'passed' | 'not_ready'>(
    evaluation?.evaluation_result || 'passed'
  );
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open && evaluation) {
      setEvaluationResult(evaluation.evaluation_result || 'passed');
      setPdfFile(null);
    }
  }, [open, evaluation]);

  const API_BASE_URL = ENV.API_BASE_URL.replace('/api', '');

  // Handle file upload
  const uploadFile = async () => {
    if (!pdfFile) return null;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      
      // Add member info to formData for naming the file
      formData.append('memberCode', evaluation?.member_code || 'unknown');
      
      if (evaluation?.evaluation_date) {
        formData.append('evaluationDate', evaluation.evaluation_date);
      } else {
        formData.append('evaluationDate', new Date().toISOString().split('T')[0]);
      }
      
      const response = await fetch(`${ENV.API_BASE_URL}/evaluations/upload-file`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to upload file');
      }
      
      return result.filePath;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Mutation for updating evaluation
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!evaluation?.id) throw new Error('No evaluation ID');
      
      // If "not ready" is selected, PDF is required
      if (evaluationResult === 'not_ready' && !pdfFile && !evaluation.evaluation_pdf) {
        throw new Error('PDF is required for "Not Ready" evaluations');
      }
      
      // Upload file if provided
      let filePath = evaluation.evaluation_pdf || null;
      if (pdfFile) {
        filePath = await uploadFile();
      }
      
      return await updateEvaluationResult(evaluation.id, evaluationResult, filePath);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        queryClient.invalidateQueries({ queryKey: ['evaluations'] });
        queryClient.invalidateQueries({ queryKey: ['completedEvaluations'] });
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Evaluation</DialogTitle>
          <DialogDescription>
            Update evaluation result and upload supporting documents.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <div className="font-medium">Member Information</div>
            <p className="text-sm">{evaluation?.member_name} ({evaluation?.member_code})</p>
          </div>
          
          <div className="space-y-2">
            <Label>Evaluation Result</Label>
            <RadioGroup 
              value={evaluationResult} 
              onValueChange={(value) => setEvaluationResult(value as 'passed' | 'not_ready')}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="passed" id="passed" />
                <Label htmlFor="passed" className="font-normal">Passed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not_ready" id="not_ready" />
                <Label htmlFor="not_ready" className="font-normal">Not Ready</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pdf">Upload Evaluation PDF</Label>
            <div className="flex items-center gap-2">
              <Input
                id="pdf"
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                className="flex-1"
              />
              {evaluation?.evaluation_pdf && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`${API_BASE_URL}/files/${evaluation.evaluation_pdf}`, '_blank')}
                >
                  View Current
                </Button>
              )}
            </div>
            {evaluationResult === 'not_ready' && !pdfFile && !evaluation?.evaluation_pdf && (
              <p className="text-sm text-red-500">PDF is required for "Not Ready" evaluations</p>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isUploading || updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isUploading || updateMutation.isPending}
              className="gap-2"
            >
              {isUploading || updateMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                  {isUploading ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4" />
                  Save Evaluation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEvaluationDialog;
