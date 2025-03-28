
import { useState } from 'react';
import { executeSql, deleteQuiz } from '@/services/dbService';
import { useToast } from '@/hooks/use-toast';

export function useQuizDeletion(onQuizDeleted: () => void) {
  const [deleteQuizId, setDeleteQuizId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const confirmDeleteQuiz = (quizId: number) => {
    setDeleteQuizId(quizId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteQuiz = async () => {
    if (!deleteQuizId) return;
    
    try {
      setIsDeleting(true);
      
      await executeSql(`
        DELETE FROM questions WHERE quiz_id = ${deleteQuizId}
      `);
      
      await deleteQuiz(deleteQuizId);
      
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });
      
      onQuizDeleted();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteQuizId(null);
      setIsDeleting(false);
    }
  };

  return {
    deleteQuizId,
    isDeleteDialogOpen,
    isDeleting,
    setIsDeleteDialogOpen,
    confirmDeleteQuiz,
    handleDeleteQuiz
  };
}
