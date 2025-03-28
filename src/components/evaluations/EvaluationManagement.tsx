
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EvaluationUploadTab from './EvaluationUploadTab';
import EvaluationListTab from './EvaluationListTab';
import CompletedEvaluationsTab from './CompletedEvaluationsTab';

interface EvaluationManagementProps {
  onRefresh: () => void;
}

const EvaluationManagement: React.FC<EvaluationManagementProps> = ({ onRefresh }) => {
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Management</CardTitle>
          <CardDescription>Upload and manage member evaluations with PDF documents</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload">
            <TabsList className="mb-4">
              <TabsTrigger value="upload">Upload New Evaluation</TabsTrigger>
              <TabsTrigger value="list">View Evaluations</TabsTrigger>
              <TabsTrigger value="completed">Completed Evaluations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload">
              <EvaluationUploadTab onUploadSuccess={handleUploadSuccess} />
            </TabsContent>
            
            <TabsContent value="list">
              <EvaluationListTab refreshTrigger={refreshTrigger} />
            </TabsContent>
            
            <TabsContent value="completed">
              <CompletedEvaluationsTab refreshTrigger={refreshTrigger} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvaluationManagement;
