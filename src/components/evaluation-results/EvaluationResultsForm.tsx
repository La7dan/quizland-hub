
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Coach {
  id: number;
  name: string;
}

interface EvaluationResultsFormProps {
  coaches: Coach[] | undefined;
  isLoadingCoaches: boolean;
  isLoadingResult: boolean;
  onSubmit: (memberName: string, memberCode: string, coachId: string) => void;
}

const EvaluationResultsForm: React.FC<EvaluationResultsFormProps> = ({
  coaches,
  isLoadingCoaches,
  isLoadingResult,
  onSubmit
}) => {
  const [memberName, setMemberName] = useState('');
  const [memberCode, setMemberCode] = useState('');
  const [coachId, setCoachId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(memberName, memberCode, coachId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Your Details</CardTitle>
        <CardDescription>
          Please enter your exact name and membership number as they appear in our records,
          and select your coach to check your evaluation status.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memberName">Your Full Name</Label>
            <Input 
              id="memberName"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Enter your exact full name"
              required
            />
          </div>
          
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
                    No coaches found
                  </div>
                )}
              </SelectContent>
            </Select>
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
