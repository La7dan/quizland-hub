
import React, { useState } from 'react';
import PendingEvaluationsList from '../PendingEvaluationsList';
import LoadingEvaluations from '../LoadingEvaluations';
import { Evaluation } from '@/services/evaluations/types';
import EditEvaluationDialog from '@/components/evaluations/EditEvaluationDialog';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

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
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditEvaluation = (evaluation: Evaluation) => {
    setEditingEvaluation(evaluation);
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
