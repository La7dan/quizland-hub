
import React, { useState } from 'react';
import { Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
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

const EvaluationResultsForm: React.FC<EvaluationResultsFormProps> = ({
  coaches,
  isLoadingCoaches,
  isLoadingResult,
  onSubmit
}) => {
  const [memberCode, setMemberCode] = useState('');
  const [coachId, setCoachId] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;
    onSubmit(memberCode, coachId, formattedDate);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Your Details</CardTitle>
        <CardDescription>
          Please enter your membership number, select your coach, and optionally the evaluation date
          to check your evaluation status.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memberCode">Your Membership Number</Label>
            <Input 
              id="memberCode"
              value={memberCode}
              onChange={(e) => setMemberCode(e.target.value)}
              placeholder="Enter your SH number"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="coach">Your Coach</Label>
            <Select
              value={coachId}
              onValueChange={setCoachId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your coach" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCoaches ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-2">Loading coaches...</span>
                  </div>
                ) : coaches && coaches.length > 0 ? (
                  coaches.map((coach: Coach) => (
                    <SelectItem key={coach.id} value={coach.id.toString()}>
                      {coach.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-muted-foreground">
                    <SelectItem value="no_coaches">No coaches found</SelectItem>
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
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, "PP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <Button type="submit" className="w-full mt-4" disabled={isLoadingResult}>
            {isLoadingResult ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : 'Check Results'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EvaluationResultsForm;
