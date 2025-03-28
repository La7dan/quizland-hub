
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { updateEvaluationResult } from '@/services/evaluations'; // Updated import
import { EvaluationDisplayItem } from '../types';
import { ENV } from '@/config/env';

export const useEvaluationUpdate = (
  evaluation: EvaluationDisplayItem | null,
  onClose: () => void
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [evaluationResult, setEvaluationResult] = useState<'passed' | 'not_ready'>(
    (evaluation?.evaluation_result as 'passed' | 'not_ready') || 'passed'
  );
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async () => {
    if (!pdfFile) return null;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      
      formData.append('memberCode', evaluation?.member_code || 'unknown');
      
      if (evaluation?.evaluation_date) {
        formData.append('evaluationDate', evaluation.evaluation_date);
      } else {
        formData.append('evaluationDate', new Date().toISOString().split('T')[0]);
      }
      
      formData.append('timestamp', Date.now().toString());
      
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

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!evaluation?.id) throw new Error('No evaluation ID');
      
      if (evaluationResult === 'not_ready' && !pdfFile && !evaluation.evaluation_pdf) {
        throw new Error('PDF is required for "Not Ready" evaluations');
      }
      
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
        queryClient.invalidateQueries({ queryKey: ['allEvaluations'] });
        onClose();
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

  return {
    evaluationResult,
    setEvaluationResult,
    pdfFile,
    setPdfFile,
    isUploading,
    handleSubmit,
    updateMutation
  };
};
