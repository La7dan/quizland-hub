
import React, { useState } from 'react';
import PendingEvaluationsList from '../PendingEvaluationsList';
import LoadingEvaluations from '../LoadingEvaluations';
import { Evaluation } from '@/services/evaluations/types';
import EditEvaluationDialog from '@/components/evaluations/EditEvaluationDialog';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { EvaluationDisplayItem } from '@/components/evaluations/types';

interface AllEvaluationsTabProps {
  allEvaluationsLoading: boolean;
  allEvaluations: Evaluation[] | undefined;
  hasConnectionError: boolean;
}

const AllEvaluationsTab: React.FC<AllEvaluationsTabProps> = ({
  allEvaluationsLoading,
  allEvaluations,
  hasConnectionError,
}) => {
  const [editingEvaluation, setEditingEvaluation] = useState<EvaluationDisplayItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditEvaluation = (evaluation: Evaluation) => {
    // Convert Evaluation to EvaluationDisplayItem
    const displayItem: EvaluationDisplayItem = {
      id: evaluation.id || 0, // Provide a default value since id is optional in Evaluation but required in EvaluationDisplayItem
      status: evaluation.status,
      nominated_at: evaluation.nominated_at,
      evaluation_date: evaluation.evaluation_date,
      evaluation_pdf: evaluation.evaluation_pdf,
      evaluation_result: evaluation.evaluation_result as 'passed' | 'not_ready',
      member_name: evaluation.member_name || '',
      member_code: evaluation.member_code || '',
      member_id: evaluation.member_id,
      coach_id: evaluation.coach_id,
      classes_count: evaluation.classes_count
    };
    
    setEditingEvaluation(displayItem);
    setIsEditDialogOpen(true);
  };

  return (
    <>
      {allEvaluationsLoading ? (
        <LoadingEvaluations />
      ) : allEvaluations && allEvaluations.length > 0 ? (
        <>
          <div className="space-y-4">
            {allEvaluations.map(evaluation => (
              <div key={evaluation.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <div className="font-medium">{evaluation.member_name}</div>
                  <div className="text-sm text-muted-foreground">{evaluation.member_code}</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => handleEditEvaluation(evaluation)}
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </Button>
              </div>
            ))}
          </div>
          <EditEvaluationDialog 
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            evaluation={editingEvaluation}
          />
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {hasConnectionError 
              ? "Unable to load evaluations due to connection issues." 
              : "No evaluations found. Create evaluations for your members to get started."}
          </p>
        </div>
      )}
    </>
  );
};

export default AllEvaluationsTab;
