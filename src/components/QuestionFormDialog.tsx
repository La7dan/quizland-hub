
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addQuestion, updateQuestion, getQuestionById } from '@/services/quizService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash, Save } from 'lucide-react';

interface QuestionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: any;
  quizId: number;
  onQuestionSaved?: () => void;
}

const QuestionFormDialog = ({ open, onOpenChange, question, quizId, onQuestionSaved }: QuestionFormDialogProps) => {
  const [questionData, setQuestionData] = useState({
    id: null as number | null,
    quiz_id: quizId,
    question_text: '',
    question_type: 'multiple_choice',
    is_visible: true,
    points: 1,
    answers: [
      { answer_text: '', is_correct: false },
      { answer_text: '', is_correct: false },
      { answer_text: '', is_correct: false },
      { answer_text: '', is_correct: false }
    ]
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      if (question) {
        // Edit mode
        setLoading(true);
        getQuestionById(question.id).then(result => {
          if (result.success) {
            setQuestionData({
              id: result.question.id,
              quiz_id: result.question.quiz_id,
              question_text: result.question.question_text,
              question_type: result.question.question_type,
              is_visible: result.question.is_visible,
              points: result.question.points,
              answers: result.answers.length > 0 ? result.answers : [
                { answer_text: '', is_correct: false },
                { answer_text: '', is_correct: false },
                { answer_text: '', is_correct: false },
                { answer_text: '', is_correct: false }
              ]
            });
          }
          setLoading(false);
        });
      } else {
        // Create mode
        setQuestionData({
          id: null,
          quiz_id: quizId,
          question_text: '',
          question_type: 'multiple_choice',
          is_visible: true,
          points: 1,
          answers: [
            { answer_text: '', is_correct: false },
            { answer_text: '', is_correct: false },
            { answer_text: '', is_correct: false },
            { answer_text: '', is_correct: false }
          ]
        });
      }
    }
  }, [open, question, quizId]);

  // Add question mutation
  const addQuestionMutation = useMutation({
    mutationFn: addQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
      toast({
        title: "Success",
        description: "Question added successfully",
      });
      onOpenChange(false);
      if (onQuestionSaved) onQuestionSaved();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add question: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: updateQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
      toast({
        title: "Success",
        description: "Question updated successfully",
      });
      onOpenChange(false);
      if (onQuestionSaved) onQuestionSaved();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update question: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    // Filter out empty answers for multiple choice questions
    let submittedData = { ...questionData };
    
    if (questionData.question_type === 'multiple_choice') {
      submittedData.answers = questionData.answers.filter(answer => answer.answer_text.trim() !== '');
      
      // Validate that we have at least two answers and one is correct
      if (submittedData.answers.length < 2) {
        toast({
          title: "Validation Error",
          description: "Multiple choice questions must have at least two answers",
          variant: "destructive",
        });
        return;
      }
      
      if (!submittedData.answers.some(answer => answer.is_correct)) {
        toast({
          title: "Validation Error",
          description: "At least one answer must be marked as correct",
          variant: "destructive",
        });
        return;
      }
    } else if (questionData.question_type === 'true_false') {
      // Set up true/false answers
      submittedData.answers = [
        { answer_text: 'True', is_correct: questionData.answers[0].is_correct },
        { answer_text: 'False', is_correct: !questionData.answers[0].is_correct }
      ];
    } else if (questionData.question_type === 'short_answer') {
      // Short answer questions might have multiple correct answers
      submittedData.answers = questionData.answers.filter(answer => answer.answer_text.trim() !== '');
      if (submittedData.answers.length === 0) {
        toast({
          title: "Validation Error",
          description: "Short answer questions must have at least one correct answer",
          variant: "destructive",
        });
        return;
      }
      // All short answers are considered correct
      submittedData.answers = submittedData.answers.map(answer => ({ ...answer, is_correct: true }));
    }

    if (questionData.id) {
      updateQuestionMutation.mutate(submittedData);
    } else {
      addQuestionMutation.mutate(submittedData);
    }
  };

  const handleAnswerChange = (index: number, field: 'answer_text' | 'is_correct', value: string | boolean) => {
    setQuestionData(prev => {
      const newAnswers = [...prev.answers];
      newAnswers[index] = { ...newAnswers[index], [field]: value };
      
      // For true/false questions, only one answer can be correct
      if (field === 'is_correct' && value === true && prev.question_type === 'true_false') {
        newAnswers.forEach((answer, i) => {
          if (i !== index) {
            newAnswers[i] = { ...newAnswers[i], is_correct: false };
          }
        });
      }
      
      return { ...prev, answers: newAnswers };
    });
  };

  const addAnswer = () => {
    setQuestionData(prev => ({
      ...prev,
      answers: [...prev.answers, { answer_text: '', is_correct: false }]
    }));
  };

  const removeAnswer = (index: number) => {
    setQuestionData(prev => ({
      ...prev,
      answers: prev.answers.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{question ? 'Edit Question' : 'Add New Question'}</DialogTitle>
          <DialogDescription>
            {question ? 'Update the question details below.' : 'Fill in the details to create a new question.'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="question_text" className="text-right">
                Question
              </Label>
              <Textarea
                id="question_text"
                value={questionData.question_text}
                onChange={(e) => setQuestionData({ ...questionData, question_text: e.target.value })}
                className="col-span-3"
                rows={3}
                placeholder="Enter your question here"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="question_type" className="text-right">
                Question Type
              </Label>
              <Select
                value={questionData.question_type}
                onValueChange={(value) => setQuestionData({ 
                  ...questionData, 
                  question_type: value,
                  // Reset answers when changing question type
                  answers: value === 'true_false' 
                    ? [{ answer_text: 'True', is_correct: true }, { answer_text: 'False', is_correct: false }]
                    : [
                        { answer_text: '', is_correct: false },
                        { answer_text: '', is_correct: false },
                        { answer_text: '', is_correct: false },
                        { answer_text: '', is_correct: false }
                      ]
                })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="points" className="text-right">
                Points
              </Label>
              <Input
                id="points"
                type="number"
                value={questionData.points}
                onChange={(e) => setQuestionData({ ...questionData, points: parseInt(e.target.value) || 1 })}
                className="col-span-3"
                min={1}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_visible" className="text-right">
                Visible
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="is_visible"
                  checked={questionData.is_visible}
                  onCheckedChange={(checked) => setQuestionData({ ...questionData, is_visible: checked })}
                />
                <Label htmlFor="is_visible">
                  {questionData.is_visible ? 'Question is visible to users' : 'Question is hidden from users'}
                </Label>
              </div>
            </div>

            <Separator className="my-2" />
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  {questionData.question_type === 'multiple_choice' 
                    ? 'Answer Choices' 
                    : questionData.question_type === 'true_false'
                    ? 'True/False Selection'
                    : 'Correct Answers'}
                </h3>
                
                {questionData.question_type === 'multiple_choice' && (
                  <Button type="button" variant="outline" size="sm" onClick={addAnswer}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Answer
                  </Button>
                )}
              </div>
              
              {questionData.question_type === 'true_false' ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label>Correct answer:</Label>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="true-option"
                          checked={questionData.answers[0]?.is_correct === true}
                          onChange={() => handleAnswerChange(0, 'is_correct', true)}
                        />
                        <Label htmlFor="true-option">True</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="false-option"
                          checked={questionData.answers[0]?.is_correct === false}
                          onChange={() => handleAnswerChange(0, 'is_correct', false)}
                        />
                        <Label htmlFor="false-option">False</Label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {questionData.answers.map((answer, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={answer.answer_text}
                        onChange={(e) => handleAnswerChange(index, 'answer_text', e.target.value)}
                        placeholder={`Answer ${index + 1}`}
                        className="flex-1"
                      />
                      {questionData.question_type === 'multiple_choice' && (
                        <>
                          <div className="flex items-center space-x-2 min-w-[100px]">
                            <Checkbox
                              id={`correct-${index}`}
                              checked={answer.is_correct}
                              onCheckedChange={(checked) => 
                                handleAnswerChange(index, 'is_correct', checked === true)
                              }
                            />
                            <Label htmlFor={`correct-${index}`} className="text-sm">
                              Correct
                            </Label>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAnswer(index)}
                            className="text-red-500"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={addQuestionMutation.isPending || updateQuestionMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={
              !questionData.question_text || 
              addQuestionMutation.isPending || 
              updateQuestionMutation.isPending
            }
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {question ? 'Update Question' : 'Add Question'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionFormDialog;
