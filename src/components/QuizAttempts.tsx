import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getQuizAttempts, deleteQuizAttempt, bulkDeleteQuizAttempts } from '@/services/quiz';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';
import { 
  Download, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  FileText,
  Trash2,
  Check
} from 'lucide-react';

interface QuizAttemptsProps {
  onRefresh?: () => void;
}

const QuizAttempts = ({ onRefresh }: QuizAttemptsProps) => {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [filteredAttempts, setFilteredAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'ascending' | 'descending'}>({
    key: 'attempt_date',
    direction: 'descending'
  });
  const [selectedAttempts, setSelectedAttempts] = useState<number[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    const filtered = attempts.filter(attempt => 
      attempt.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.member_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.quiz_title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredAttempts(filtered);
    setSelectedAttempts([]);
  }, [searchTerm, attempts]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading quiz attempts data');
      const response = await getQuizAttempts();
      console.log('Quiz attempts response:', response);
      
      if (response.success) {
        console.log('Loaded attempts:', response.attempts);
        setAttempts(response.attempts || []);
        setFilteredAttempts(response.attempts || []);
        
        if (response.attempts?.length === 0) {
          console.log('No quiz attempts found in the database');
          toast({
            title: "No Attempts Found",
            description: "No quiz attempts have been recorded in the database yet.",
          });
        }
      } else {
        console.error('Failed to load quiz attempts:', response.message);
        toast({
          title: "Error",
          description: response.message || "Failed to load quiz attempts",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading quiz attempts:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz attempts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSelectedAttempts([]);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
    
    const sortedData = [...filteredAttempts].sort((a, b) => {
      if (key === 'percentage' || key === 'score') {
        return direction === 'ascending' 
          ? parseFloat(a[key]) - parseFloat(b[key])
          : parseFloat(b[key]) - parseFloat(a[key]);
      }
      
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredAttempts(sortedData);
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    
    return sortConfig.direction === 'ascending' 
      ? <ArrowUp className="h-4 w-4 inline ml-1" /> 
      : <ArrowDown className="h-4 w-4 inline ml-1" />;
  };

  const exportToCSV = (data: any[] = filteredAttempts) => {
    if (data.length === 0) {
      toast({
        title: "Export Failed",
        description: "No data to export",
        variant: "destructive",
      });
      return;
    }
    
    const headers = [
      "Date", 
      "Quiz", 
      "Name", 
      "Member ID", 
      "Score", 
      "Percentage", 
      "Result"
    ];
    
    const csvData = data.map(item => [
      format(new Date(item.attempt_date), 'yyyy-MM-dd HH:mm:ss'),
      item.quiz_title,
      item.visitor_name,
      item.member_id,
      item.score,
      item.percentage + '%',
      item.result === 'passed' ? 'Passed' : 'Not Ready'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quiz_attempts_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportToPDF = (data: any[] = filteredAttempts) => {
    toast({
      title: "PDF Export",
      description: "PDF export is currently being implemented",
    });
  };

  const exportSingleAttempt = (attempt: any) => {
    exportToCSV([attempt]);
  };

  const toggleSelection = (id: number) => {
    setSelectedAttempts(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedAttempts.length === filteredAttempts.length) {
      setSelectedAttempts([]);
    } else {
      setSelectedAttempts(filteredAttempts.map(attempt => attempt.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAttempts.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one attempt to delete",
        variant: "destructive",
      });
      return;
    }
    
    setIsConfirmDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await bulkDeleteQuizAttempts(selectedAttempts);
      
      if (response.success) {
        toast({
          title: "Success",
          description: `${response.count} attempts deleted successfully`,
        });
        
        loadData();
        
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete attempts",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting attempts:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsConfirmDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Quiz Attempts</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportToCSV()}
              className="whitespace-nowrap"
            >
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportToPDF()}
              className="whitespace-nowrap"
            >
              <FileText className="h-4 w-4 mr-1" />
              Export PDF
            </Button>

            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleBulkDelete}
              disabled={selectedAttempts.length === 0}
              className="whitespace-nowrap"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected ({selectedAttempts.length})
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredAttempts.length === 0 ? (
        <div className="text-center py-8 bg-muted rounded-md">
          <p className="text-muted-foreground">
            {searchTerm ? "No matching quiz attempts found." : "No quiz attempts found."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>List of quiz attempts{searchTerm ? " (filtered)" : ""}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox 
                    checked={selectedAttempts.length === filteredAttempts.length && filteredAttempts.length > 0}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all attempts"
                  />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('attempt_date')}>
                  Date {getSortIcon('attempt_date')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('quiz_title')}>
                  Quiz {getSortIcon('quiz_title')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('visitor_name')}>
                  Name {getSortIcon('visitor_name')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('member_id')}>
                  Member ID {getSortIcon('member_id')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('score')}>
                  Score {getSortIcon('score')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('percentage')}>
                  Percentage {getSortIcon('percentage')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('result')}>
                  Result {getSortIcon('result')}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttempts.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedAttempts.includes(attempt.id)}
                      onCheckedChange={() => toggleSelection(attempt.id)}
                      aria-label={`Select attempt by ${attempt.visitor_name}`}
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(attempt.attempt_date), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell>{attempt.quiz_title}</TableCell>
                  <TableCell>{attempt.visitor_name}</TableCell>
                  <TableCell>{attempt.member_id}</TableCell>
                  <TableCell>{attempt.score}</TableCell>
                  <TableCell>{attempt.percentage}%</TableCell>
                  <TableCell>
                    {attempt.result === 'passed' ? (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        Passed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-500">
                        Not Ready
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => exportSingleAttempt(attempt)}
                      title="Export this entry"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedAttempts.length} selected attempts?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmBulkDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizAttempts;
