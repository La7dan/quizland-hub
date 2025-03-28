
import { executeSql } from './dbService';

export interface Member {
  id?: number;
  member_id: string;
  name: string;
  level_id?: number;
  level_code?: string;
  level_name?: string;
  classes_count?: number;
  coach_id?: number;
  coach_name?: string;
  created_at?: string;
}

export const getMembers = async (): Promise<{
  success: boolean;
  members?: Member[];
  message?: string;
}> => {
  try {
    console.log('Fetching members from database...');
    const result = await executeSql(`
      SELECT m.id, m.member_id, m.name, m.classes_count, m.coach_id, m.created_at, 
             l.id AS level_id, l.name AS level_name, l.code AS level_code,
             u.username AS coach_name
      FROM members m
      LEFT JOIN quiz_levels l ON m.level_id = l.id
      LEFT JOIN users u ON m.coach_id = u.id
      ORDER BY m.name;
    `);
    
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

export const createMember = async (member: Member): Promise<{
  success: boolean;
  id?: number;
  message?: string;
}> => {
  try {
    // Validate member data
    if (!member.member_id || !member.name) {
      return {
        success: false,
        message: 'Member ID and name are required'
      };
    }

    const result = await executeSql(`
      INSERT INTO members (member_id, name, level_id, classes_count, coach_id)
      VALUES ('${member.member_id}', '${member.name}', ${member.level_id || 'NULL'}, ${member.classes_count || 0}, ${member.coach_id || 'NULL'})
      RETURNING id;
    `);

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

export const updateMember = async (member: Member): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    // Validate member data
    if (!member.id || !member.member_id || !member.name) {
      return {
        success: false,
        message: 'Member ID, name, and record ID are required'
      };
    }

    const result = await executeSql(`
      UPDATE members
      SET member_id = '${member.member_id}',
          name = '${member.name}',
          level_id = ${member.level_id || 'NULL'},
          classes_count = ${member.classes_count || 0},
          coach_id = ${member.coach_id || 'NULL'}
      WHERE id = ${member.id};
    `);

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

export const deleteMember = async (id: number): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const result = await executeSql(`
      DELETE FROM members
      WHERE id = ${id};
    `);

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

export const importMembers = async (members: Member[]): Promise<{
  success: boolean;
  successCount?: number;
  errorCount?: number;
  errors?: string[];
  message?: string;
}> => {
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

        const result = await executeSql(`
          INSERT INTO members (member_id, name, level_id, classes_count, coach_id)
          VALUES ('${member.member_id}', '${member.name}', ${member.level_id || 'NULL'}, ${member.classes_count || 0}, ${member.coach_id || 'NULL'})
          ON CONFLICT (member_id) DO UPDATE
          SET name = EXCLUDED.name,
              level_id = EXCLUDED.level_id,
              classes_count = EXCLUDED.classes_count,
              coach_id = EXCLUDED.coach_id;
        `);

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
