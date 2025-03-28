
import { 
  fetchMembersQuery,
  createMemberQuery,
  updateMemberQuery,
  deleteMemberQuery,
  importMemberQuery,
  batchImportMemberQuery
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
    console.log(`Starting import of ${members.length} members`);
    
    // Use batch import for larger datasets
    if (members.length > 50) {
      return await batchImportMembers(members);
    }
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each member for smaller batches
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

    console.log(`Import complete: ${successCount} successful, ${errorCount} errors`);
    
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

// New function for batch processing larger imports
const batchImportMembers = async (members: Member[]): Promise<MemberImportResponse> => {
  try {
    console.log(`Using batch import for ${members.length} members`);
    
    // Process in batches of 50
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < members.length; i += batchSize) {
      batches.push(members.slice(i, i + batchSize));
    }
    
    console.log(`Split into ${batches.length} batches`);
    
    let totalSuccess = 0;
    let totalErrors = 0;
    const allErrors: string[] = [];
    
    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} members`);
      
      try {
        const batchResult = await batchImportMemberQuery(batch);
        
        if (batchResult.success) {
          // Check if we have the successful batch result shape
          if ('successCount' in batchResult) {
            totalSuccess += batchResult.successCount || 0;
            totalErrors += batchResult.errorCount || 0;
            
            if (batchResult.errors && batchResult.errors.length > 0) {
              allErrors.push(...batchResult.errors);
            }
          } else {
            // This batch was successful but we don't have detailed stats
            // Assume all members were imported successfully
            totalSuccess += batch.length;
          }
        } else {
          // If the whole batch failed
          totalErrors += batch.length;
          
          // Add error message if available
          if ('message' in batchResult) {
            allErrors.push(`Batch ${batchIndex + 1} failed: ${batchResult.message}`);
          } else {
            allErrors.push(`Batch ${batchIndex + 1} failed: Unknown error`);
          }
        }
      } catch (error) {
        totalErrors += batch.length;
        allErrors.push(`Batch ${batchIndex + 1} error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    console.log(`Batch import complete: ${totalSuccess} successful, ${totalErrors} errors`);
    
    return {
      success: true,
      successCount: totalSuccess,
      errorCount: totalErrors,
      errors: allErrors.length > 0 ? allErrors : undefined
    };
  } catch (error) {
    console.error('Error in batchImportMembers:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Re-export types
export type { Member, MemberResponse, MemberActionResponse, MemberImportResponse };
