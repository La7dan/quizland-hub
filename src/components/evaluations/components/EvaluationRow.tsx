
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, FileCheck } from 'lucide-react';
import { ENV } from '@/config/env';
import { EvaluationDisplayItem } from '../types';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface EvaluationRowProps {
  evaluation: EvaluationDisplayItem;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

const EvaluationRow: React.FC<EvaluationRowProps> = ({ 
  evaluation, 
  onDelete,
  isDeleting
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    onDelete(evaluation.id);
  };

  return (
    <div key={evaluation.id} className="grid grid-cols-6 gap-4 p-4 items-center">
      <div>
        <div className="font-medium">{evaluation.member_name}</div>
        <div className="text-sm text-muted-foreground">{evaluation.member_code}</div>
      </div>
      <div>{evaluation.status}</div>
      <div>
        {evaluation.evaluation_date 
          ? new Date(evaluation.evaluation_date).toLocaleDateString() 
          : 'Not set'}
      </div>
      <div>{new Date(evaluation.nominated_at).toLocaleDateString()}</div>
      <div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          evaluation.evaluation_result === 'passed' 
            ? 'bg-green-100 text-green-800' 
            : evaluation.evaluation_result === 'not_ready'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-gray-100 text-gray-800'
        }`}>
          {evaluation.evaluation_result || 'Not set'}
        </span>
      </div>
      <div className="flex justify-end items-center space-x-2">
        {evaluation.evaluation_pdf && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => {
              const API_BASE_URL = ENV.API_BASE_URL?.replace('/api', '') || '';
              const fileUrl = evaluation.evaluation_pdf?.startsWith('http') 
                ? evaluation.evaluation_pdf 
                : `${API_BASE_URL}/files/${evaluation.evaluation_pdf}`;
              window.open(fileUrl, '_blank');
            }}
          >
            <FileCheck className="h-4 w-4 text-blue-500" />
            PDF
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Evaluation"
        description="Are you sure you want to delete this evaluation? This action cannot be undone."
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
};

export default EvaluationRow;
