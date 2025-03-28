
import { executeSql } from './dbService';

export interface Member {
  id?: number;
  member_id: string;
  name: string;
  level_id?: number | null;
  level_name?: string;
  level_code?: string;
  classes_count?: number;
  coach_id?: number | null;
  coach_name?: string;
  created_at?: string;
}

// Get all members
export const getMembers = async (): Promise<{ success: boolean; members: Member[]; message?: string }> => {
  try {
    const result = await executeSql(`
      SELECT m.id, m.member_id, m.name, m.classes_count, m.coach_id, m.created_at, 
             l.id AS level_id, l.name AS level_name, l.code AS level_code,
             u.username AS coach_name
      FROM members m
      LEFT JOIN quiz_levels l ON m.level_id = l.id
      LEFT JOIN users u ON m.coach_id = u.id
      ORDER BY m.name;
    `);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return { success: true, members: result.rows || [] };
  } catch (error) {
    console.error('Get members error:', error);
    return { success: false, members: [], message: 'Failed to fetch members' };
  }
};

// Create a new member
export const createMember = async (member: Member): Promise<{ success: boolean; message: string; memberId?: number }> => {
  try {
    const { member_id, name, level_id, classes_count, coach_id } = member;
    
    const sql = `
      INSERT INTO members (member_id, name, level_id, classes_count, coach_id)
      VALUES ('${member_id}', '${name}', ${level_id || 'NULL'}, ${classes_count || 0}, ${coach_id || 'NULL'})
      RETURNING id;
    `;
    
    const result = await executeSql(sql);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    const memberId = result.rows && result.rows[0] ? result.rows[0].id : undefined;
    
    return { 
      success: true, 
      message: 'Member created successfully', 
      memberId 
    };
  } catch (error) {
    console.error('Create member error:', error);
    return { success: false, message: `Failed to create member: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

// Update a member
export const updateMember = async (member: Member): Promise<{ success: boolean; message: string }> => {
  try {
    if (!member.id) {
      throw new Error('Member ID is required for update');
    }
    
    const { id, member_id, name, level_id, classes_count, coach_id } = member;
    
    const sql = `
      UPDATE members
      SET member_id = '${member_id}',
          name = '${name}',
          level_id = ${level_id || 'NULL'},
          classes_count = ${classes_count || 0},
          coach_id = ${coach_id || 'NULL'}
      WHERE id = ${id};
    `;
    
    const result = await executeSql(sql);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return { success: true, message: 'Member updated successfully' };
  } catch (error) {
    console.error('Update member error:', error);
    return { success: false, message: `Failed to update member: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

// Delete a member
export const deleteMember = async (memberId: number): Promise<{ success: boolean; message: string }> => {
  try {
    const result = await executeSql(`DELETE FROM members WHERE id = ${memberId};`);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return { success: true, message: 'Member deleted successfully' };
  } catch (error) {
    console.error('Delete member error:', error);
    return { success: false, message: `Failed to delete member: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

// Import members from CSV
export const importMembers = async (members: Member[]): Promise<{ 
  success: boolean; 
  message: string;
  successCount?: number;
  errorCount?: number;
  errors?: string[];
}> => {
  if (!members || members.length === 0) {
    return { 
      success: false, 
      message: 'No members to import' 
    };
  }

  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (const member of members) {
    try {
      const result = await createMember(member);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
        errors.push(`Error importing ${member.name}: ${result.message}`);
      }
    } catch (error) {
      errorCount++;
      errors.push(`Error processing ${member.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    success: successCount > 0,
    message: `Imported ${successCount} members with ${errorCount} errors`,
    successCount,
    errorCount,
    errors: errors.length > 0 ? errors : undefined
  };
};

// Get member by ID
export const getMemberById = async (memberId: number): Promise<{ success: boolean; member?: Member; message?: string }> => {
  try {
    const result = await executeSql(`
      SELECT m.id, m.member_id, m.name, m.classes_count, m.coach_id, m.created_at, 
             l.id AS level_id, l.name AS level_name, l.code AS level_code,
             u.username AS coach_name
      FROM members m
      LEFT JOIN quiz_levels l ON m.level_id = l.id
      LEFT JOIN users u ON m.coach_id = u.id
      WHERE m.id = ${memberId};
    `);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    if (!result.rows || result.rows.length === 0) {
      return { success: false, message: 'Member not found' };
    }
    
    return { success: true, member: result.rows[0] };
  } catch (error) {
    console.error('Get member by ID error:', error);
    return { success: false, message: `Failed to fetch member: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};
