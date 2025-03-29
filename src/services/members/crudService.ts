
import { Member, MemberActionResponse } from './types';
import { createMemberQuery, updateMemberQuery, deleteMemberQuery } from './memberQueries';

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
