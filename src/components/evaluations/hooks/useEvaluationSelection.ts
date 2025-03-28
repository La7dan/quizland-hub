
import { useState } from 'react';
import { EvaluationDisplayItem } from '../types';

export const useEvaluationSelection = (filteredEvaluations: EvaluationDisplayItem[]) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked && filteredEvaluations) {
      setSelectedIds(filteredEvaluations.map((evaluation) => evaluation.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(evalId => evalId !== id));
    }
  };

  const resetSelection = () => {
    setSelectedIds([]);
  };

  const isSelected = (id: number) => selectedIds.includes(id);

  const allSelected = 
    selectedIds.length === filteredEvaluations?.length && 
    filteredEvaluations?.length > 0;

  return {
    selectedIds,
    handleSelectAll,
    handleSelectOne,
    resetSelection,
    isSelected,
    allSelected
  };
};
