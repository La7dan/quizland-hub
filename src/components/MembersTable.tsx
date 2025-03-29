
import MembersTableContainer from './members/MembersTableContainer';

interface MembersTableProps {
  onRefresh?: () => void;
}

const MembersTable: React.FC<MembersTableProps> = ({ onRefresh }) => {
  return <MembersTableContainer onRefresh={onRefresh} />;
};

export default MembersTable;
