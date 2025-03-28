
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getQuizAttempts } from '@/services/quizService';
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
import { format } from 'date-fns';
import { 
  Download, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  FileText 
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
  const { toast } = useToast();
  
  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    // Filter attempts based on search term
    const filtered = attempts.filter(attempt => 
      attempt.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.member_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.quiz_title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredAttempts(filtered);
  }, [searchTerm, attempts]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getQuizAttempts();
      
      if (response.success) {
        setAttempts(response.attempts || []);
        setFilteredAttempts(response.attempts || []);
      } else {
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
    }
  };

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
    
    // Sort the data
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
    
    // Create CSV headers
    const headers = [
      "Date", 
      "Quiz", 
      "Name", 
      "Member ID", 
      "Score", 
      "Percentage", 
      "Result"
    ];
    
    // Map data to CSV format
    const csvData = data.map(item => [
      format(new Date(item.attempt_date), 'yyyy-MM-dd HH:mm:ss'),
      item.quiz_title,
      item.visitor_name,
      item.member_id,
      item.score,
      item.percentage + '%',
      item.result === 'passed' ? 'Passed' : 'Not Ready'
    ]);
    
    // Combine headers and data
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
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
    
    // For future implementation with PDF generation library
  };

  const exportSingleAttempt = (attempt: any) => {
    exportToCSV([attempt]);
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
    </div>
  );
};

export default QuizAttempts;
