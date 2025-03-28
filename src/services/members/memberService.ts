
import { 
  fetchMembersQuery,
  createMemberQuery,
  updateMemberQuery,
  deleteMemberQuery,
  importMemberQuery
} from './memberQueries';
import { Member, MemberResponse, MemberActionResponse, MemberImportResponse } from './types';

export const getMembers = async (): Promise<MemberResponse> => {
  try {
    const result = await fetchMembersQuery();
    
    if (result.success) {
      console.log(`Found ${result.rows?.length || 0} members`);
      return {
        success: true,
        members: result.rows || []
      };
    } else {
      console.error('Failed to fetch members:', result.message);
      return {
        success: false,
        message: result.message || 'Failed to fetch members'
      };
    }
  } catch (error) {
    console.error('Error in getMembers:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const createMember = async (member: Member): Promise<MemberActionResponse> => {
  try {
    // Validate member data
    if (!member.member_id || !member.name) {
      return {
        success: false,
        message: 'Member ID and name are required'
      };
    }

    const result = await createMemberQuery(member);

    if (result.success && result.rows && result.rows.length > 0) {
      return {
        success: true,
        id: result.rows[0].id
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to create member'
      };
    }
  } catch (error) {
    console.error('Error in createMember:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const updateMember = async (member: Member): Promise<MemberActionResponse> => {
  try {
    // Validate member data
    if (!member.id || !member.member_id || !member.name) {
      return {
        success: false,
        message: 'Member ID, name, and record ID are required'
      };
    }

    const result = await updateMemberQuery(member);

    if (result.success) {
      return {
        success: true
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to update member'
      };
    }
  } catch (error) {
    console.error('Error in updateMember:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const deleteMember = async (id: number): Promise<MemberActionResponse> => {
  try {
    const result = await deleteMemberQuery(id);

    if (result.success) {
      return {
        success: true
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to delete member'
      };
    }
  } catch (error) {
    console.error('Error in deleteMember:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const importMembers = async (members: Member[]): Promise<MemberImportResponse> => {
  if (!members || members.length === 0) {
    return {
      success: false,
      message: 'No members provided for import'
    };
  }

  try {
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each member
    for (const member of members) {
      try {
        if (!member.member_id || !member.name) {
          throw new Error('Member ID and name are required');
        }

        const result = await importMemberQuery(member);

        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          errors.push(`Member ${member.member_id}: ${result.message}`);
        }
      } catch (error) {
        errorCount++;
        errors.push(`Member ${member.member_id || 'unknown'}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: true,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error('Error in importMembers:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Re-export types
export type { Member, MemberResponse, MemberActionResponse, MemberImportResponse };
