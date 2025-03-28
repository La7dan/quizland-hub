
import React, { useState, useEffect } from 'react';
import { getMembers, Member } from '@/services/memberService';
import { useToast } from '@/components/ui/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertCircle, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MembersTableProps {
  onRefresh?: () => void;
}

const MembersTable: React.FC<MembersTableProps> = ({ onRefresh }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching members...');
      const result = await getMembers();
      console.log('Fetch members result:', result);
      
      if (result.success) {
        setMembers(result.members);
      } else {
        setError(result.message || 'Failed to fetch members');
        toast({
          title: "Error",
          description: result.message || "Failed to fetch members",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('An unexpected error occurred');
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleRefresh = () => {
    fetchMembers();
    if (onRefresh) onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Members
        </h2>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-md text-sm transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No members found. Click the "Setup Database" button to create sample members or add members manually.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Coach</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.member_id}</TableCell>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>
                    {member.level_code ? (
                      <Badge variant="outline" className="bg-blue-50">
                        {member.level_code} - {member.level_name}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>{member.classes_count || 0}</TableCell>
                  <TableCell>
                    {member.coach_name || <span className="text-gray-400">Not assigned</span>}
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

export default MembersTable;
