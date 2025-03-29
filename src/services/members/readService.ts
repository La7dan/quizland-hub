
import { MemberResponse } from './types';
import { fetchMembersQuery } from './memberQueries';

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
