
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EvaluationDisplayItem } from './types';
import EditEvaluationForm from './EditEvaluationForm';
import { useEvaluationUpdate } from './hooks/useEvaluationUpdate';

interface EditEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluation: EvaluationDisplayItem | null;
}

const EditEvaluationDialog: React.FC<EditEvaluationDialogProps> = ({
  open,
  onOpenChange,
  evaluation
}) => {
  const {
    evaluationResult,
    setEvaluationResult,
    pdfFile, 
    setPdfFile,
    isUploading,
    handleSubmit,
    updateMutation
  } = useEvaluationUpdate(evaluation, () => onOpenChange(false));

  // Reset form when dialog opens with new evaluation
  useEffect(() => {
    if (open && evaluation) {
      setEvaluationResult((evaluation.evaluation_result as 'passed' | 'not_ready') || 'passed');
      setPdfFile(null);
    }
  }, [open, evaluation, setEvaluationResult, setPdfFile]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Evaluation</DialogTitle>
          <DialogDescription>
            Update evaluation result and upload supporting documents.
          </DialogDescription>
        </DialogHeader>
        
        <EditEvaluationForm
          evaluation={evaluation}
          isUploading={isUploading}
          isPending={updateMutation.isPending}
          evaluationResult={evaluationResult}
          setEvaluationResult={setEvaluationResult}
          setPdfFile={setPdfFile}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditEvaluationDialog;
