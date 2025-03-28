
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { FileUp } from 'lucide-react';
import { ENV } from '@/config/env';
import { EvaluationDisplayItem } from './types';

interface EditEvaluationFormProps {
  evaluation: EvaluationDisplayItem | null;
  isUploading: boolean;
  isPending: boolean;
  evaluationResult: 'passed' | 'not_ready';
  setEvaluationResult: (value: 'passed' | 'not_ready') => void;
  setPdfFile: (file: File | null) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const EditEvaluationForm: React.FC<EditEvaluationFormProps> = ({
  evaluation,
  isUploading,
  isPending,
  evaluationResult,
  setEvaluationResult,
  setPdfFile,
  onCancel,
  onSubmit
}) => {
  const API_BASE_URL = ENV.API_BASE_URL.replace('/api', '');

  return (
    <form onSubmit={onSubmit} className="space-y-4 pt-4">
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
              onClick={() => {
                const fileUrl = `${API_BASE_URL}/files/${evaluation.evaluation_pdf}`;
                window.open(fileUrl, '_blank');
              }}
            >
              View Current
            </Button>
          )}
        </div>
        {evaluationResult === 'not_ready' && !evaluation?.evaluation_pdf && (
          <p className="text-sm text-red-500">PDF is required for "Not Ready" evaluations</p>
        )}
      </div>
      
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-2 sm:mt-0">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isUploading || isPending}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isUploading || isPending}
          className="gap-2"
        >
          {isUploading || isPending ? (
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
      </div>
    </form>
  );
};

export default EditEvaluationForm;
