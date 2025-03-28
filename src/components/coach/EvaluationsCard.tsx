
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import PendingEvaluationsList from './PendingEvaluationsList';
import LoadingEvaluations from './LoadingEvaluations';
import EmptyEvaluations from './EmptyEvaluations';
import EvaluationsErrorDisplay from './EvaluationsErrorDisplay';
import { Evaluation } from '@/services/evaluations/types';

interface EvaluationsCardProps {
  isLoading: boolean;
  error: Error | null;
  evaluations: Evaluation[] | undefined;
}

const EvaluationsCard: React.FC<EvaluationsCardProps> = ({ isLoading, error, evaluations }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Evaluations</CardTitle>
        <CardDescription>
          Members nominated for evaluation that need your approval
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingEvaluations />
        ) : error ? (
          <EvaluationsErrorDisplay />
        ) : evaluations && evaluations.length > 0 ? (
          <PendingEvaluationsList evaluations={evaluations} />
        ) : (
          <EmptyEvaluations />
        )}
      </CardContent>
    </Card>
  );
};

export default EvaluationsCard;
