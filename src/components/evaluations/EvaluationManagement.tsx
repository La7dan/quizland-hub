
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import EvaluationUploadTab from './EvaluationUploadTab';
import BulkEvaluationTab from './BulkEvaluationTab';
import EvaluationListTab from './EvaluationListTab';
import CompletedEvaluationsTab from './CompletedEvaluationsTab';

interface EvaluationManagementProps {
  onRefresh?: () => void;
}

const EvaluationManagement: React.FC<EvaluationManagementProps> = ({ onRefresh }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger refresh after operations
  const handleRefresh = () => {
    console.log('Refreshing evaluation data...');
    setRefreshTrigger(prev => prev + 1);
    // If there's an onRefresh prop, call it too
    if (onRefresh) onRefresh();
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Evaluation Management</h1>
      
      <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload Evaluation</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          <TabsTrigger value="all">All Evaluations</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Evaluation</CardTitle>
              <CardDescription>
                Upload evaluation PDFs and assign them to members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EvaluationUploadTab onUploadSuccess={handleRefresh} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Evaluation Upload</CardTitle>
              <CardDescription>
                Upload multiple evaluations at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulkEvaluationTab onSuccess={handleRefresh} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Evaluations</CardTitle>
              <CardDescription>
                View and manage all evaluations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EvaluationListTab refreshTrigger={refreshTrigger} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Evaluations</CardTitle>
              <CardDescription>
                View evaluations with PDF files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompletedEvaluationsTab refreshTrigger={refreshTrigger} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EvaluationManagement;
