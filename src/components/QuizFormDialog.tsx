import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { createQuiz, updateQuiz, getQuizLevels } from '@/services/quiz';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuizFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz?: any;
  levels: any[];
  onQuizSaved?: () => void;
}

const QuizFormDialog = ({ 
  open, 
  onOpenChange, 
  quiz, 
  levels, 
  onQuizSaved 
}: QuizFormDialogProps) => {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const isEditing = !!quiz;
  
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      level_id: "",
      passing_percentage: 70,
      is_visible: true,
    }
  });

  useEffect(() => {
    if (quiz) {
      form.reset({
        title: quiz.title || "",
        description: quiz.description || "",
        level_id: quiz.level_id ? String(quiz.level_id) : "",
        passing_percentage: quiz.passing_percentage || 70,
        is_visible: quiz.is_visible !== undefined ? quiz.is_visible : true,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        level_id: "",
        passing_percentage: 70,
        is_visible: true,
      });
    }
  }, [quiz, form]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      // Convert level_id to number if it's not "none"
      const formattedData = {
        ...data,
        level_id: data.level_id && data.level_id !== "none" ? parseInt(data.level_id) : null,
      };

      let response;
      if (isEditing) {
        response = await updateQuiz({ ...formattedData, id: quiz.id });
      } else {
        response = await createQuiz(formattedData);
      }

      if (response.success) {
        toast({
          title: "Success",
          description: `Quiz ${isEditing ? 'updated' : 'created'} successfully`,
        });
        onOpenChange(false);
        if (onQuizSaved) onQuizSaved();
      } else {
        toast({
          title: "Error",
          description: response.message || `Failed to ${isEditing ? 'update' : 'create'} quiz`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} quiz:`, error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} quiz`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Quiz' : 'Create Quiz'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the quiz details below.' 
              : 'Fill in the details to create a new quiz.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter quiz title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter quiz description" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quiz Level</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {levels.map((level) => (
                        <SelectItem key={level.id} value={String(level.id)}>
                          {level.code} - {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passing_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passing Percentage</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="100"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum percentage required to pass the quiz.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_visible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Visibility</FormLabel>
                    <FormDescription>
                      Make this quiz visible to visitors
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Update Quiz' : 'Create Quiz'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default QuizFormDialog;
