
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Coach {
  id: number;
  name: string;
}

interface EvaluationResultsFormProps {
  coaches: Coach[] | undefined;
  isLoadingCoaches: boolean;
  isLoadingResult: boolean;
  onSubmit: (memberCode: string, coachId: string, evaluationDate: string | null) => void;
}

export const EvaluationResultsForm: React.FC<EvaluationResultsFormProps> = ({
  coaches,
  isLoadingCoaches,
  isLoadingResult,
  onSubmit,
}) => {
  const [memberCode, setMemberCode] = useState('');
  const [coachId, setCoachId] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;
    onSubmit(memberCode, coachId, formattedDate);
  };
  
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-4">Find Your Evaluation</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="memberCode">Member ID (starts with SH)</Label>
          <Input
            id="memberCode"
            value={memberCode}
            onChange={(e) => setMemberCode(e.target.value)}
            placeholder="Enter your Member ID"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="coach">Coach</Label>
          <Select 
            value={coachId} 
            onValueChange={setCoachId}
            required
          >
            <SelectTrigger id="coach" className="w-full">
              <SelectValue placeholder="Select your coach" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingCoaches ? (
                <div className="p-2 text-center text-muted-foreground">
                  <SelectItem value="loading">Loading coaches...</SelectItem>
                </div>
              ) : coaches && coaches.length > 0 ? (
                coaches.map((coach) => (
                  <SelectItem key={coach.id} value={String(coach.id)}>
                    {coach.name}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-center text-muted-foreground">
                  <SelectItem value="no_coaches_found">No coaches found</SelectItem>
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">Evaluation Date (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {date && (
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Date selected. Leave empty to find your most recent evaluation.
            </div>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoadingResult || !memberCode || !coachId}
        >
          {isLoadingResult ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking Results...
            </span>
          ) : (
            "Check Results"
          )}
        </Button>
      </form>
    </div>
  );
};
