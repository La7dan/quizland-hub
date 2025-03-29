
import { useEffect, useState } from 'react';
import { Member } from '@/services/members/memberService';

export const useDuplicateMemberDetection = (members: Member[]) => {
  const [duplicateMembers, setDuplicateMembers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const memberIdCounts: Record<string, number> = {};
    const duplicates = new Set<string>();
    
    members.forEach(member => {
      if (member.member_id) {
        memberIdCounts[member.member_id] = (memberIdCounts[member.member_id] || 0) + 1;
        
        if (memberIdCounts[member.member_id] > 1) {
          duplicates.add(member.member_id);
        }
      }
    });
    
    setDuplicateMembers(duplicates);
  }, [members]);

  const isDuplicate = (memberId?: string) => {
    if (!memberId) return false;
    return duplicateMembers.has(memberId);
  };

  return { isDuplicate, duplicateMembers };
};
