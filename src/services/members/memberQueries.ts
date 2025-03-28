
import { executeSql, sqlEscape } from '../apiService';
import { Member } from './types';

export const fetchMembersQuery = async () => {
  console.log('Fetching members from database...');
  return await executeSql(`
    SELECT m.id, m.member_id, m.name, m.classes_count, m.coach_id, m.created_at, 
           l.id AS level_id, l.name AS level_name, l.code AS level_code,
           u.username AS coach_name
    FROM members m
    LEFT JOIN quiz_levels l ON m.level_id = l.id
    LEFT JOIN users u ON m.coach_id = u.id
    ORDER BY m.name;
  `);
};

export const createMemberQuery = async (member: Member) => {
  return await executeSql(`
    INSERT INTO members (member_id, name, level_id, classes_count, coach_id)
    VALUES ('${member.member_id}', '${member.name}', ${member.level_id || 'NULL'}, ${member.classes_count || 0}, ${member.coach_id || 'NULL'})
    RETURNING id;
  `);
};

export const updateMemberQuery = async (member: Member) => {
  return await executeSql(`
    UPDATE members
    SET member_id = '${member.member_id}',
        name = '${member.name}',
        level_id = ${member.level_id || 'NULL'},
        classes_count = ${member.classes_count || 0},
        coach_id = ${member.coach_id || 'NULL'}
    WHERE id = ${member.id};
  `);
};

export const deleteMemberQuery = async (id: number) => {
  return await executeSql(`
    DELETE FROM members
    WHERE id = ${id};
  `);
};

export const importMemberQuery = async (member: Member) => {
  return await executeSql(`
    INSERT INTO members (member_id, name, level_id, classes_count, coach_id)
    VALUES ('${member.member_id}', '${member.name}', ${member.level_id || 'NULL'}, ${member.classes_count || 0}, ${member.coach_id || 'NULL'})
    ON CONFLICT (member_id) DO UPDATE
    SET name = EXCLUDED.name,
        level_id = EXCLUDED.level_id,
        classes_count = EXCLUDED.classes_count,
        coach_id = EXCLUDED.coach_id;
  `);
};

export const batchImportMemberQuery = async (members: Member[]) => {
  if (members.length === 0) {
    return { success: false, message: 'No members provided for batch import' };
  }
  
  try {
    // First deduplicate members to avoid conflicts within the batch
    const uniqueMembers = deduplicateMembers(members);
    console.log(`Deduplicating ${members.length} members to ${uniqueMembers.length} unique members`);
    
    // If we have too many members, split into smaller batches
    const maxBatchSize = 25; // Smaller batch size to reduce risk of errors
    const results = {
      success: true,
      successCount: 0,
      errorCount: 0,
      errors: [] as string[]
    };
    
    // Process in smaller chunks to avoid SQL statement size limitations
    for (let i = 0; i < uniqueMembers.length; i += maxBatchSize) {
      const batch = uniqueMembers.slice(i, i + maxBatchSize);
      console.log(`Processing sub-batch ${Math.floor(i / maxBatchSize) + 1} with ${batch.length} members`);
      
      const valuesClauses = batch.map(member => `(
        ${sqlEscape.string(member.member_id)}, 
        ${sqlEscape.string(member.name)}, 
        ${sqlEscape.number(member.level_id)}, 
        ${sqlEscape.number(member.classes_count || 0)}, 
        ${sqlEscape.number(member.coach_id)}
      )`).join(',\n');
      
      const sql = `
        WITH import_data AS (
          INSERT INTO members (member_id, name, level_id, classes_count, coach_id)
          VALUES ${valuesClauses}
          ON CONFLICT (member_id) DO UPDATE
          SET name = EXCLUDED.name,
              level_id = EXCLUDED.level_id,
              classes_count = EXCLUDED.classes_count,
              coach_id = EXCLUDED.coach_id
          RETURNING id
        )
        SELECT COUNT(*) AS success_count FROM import_data;
      `;
      
      const result = await executeSql(sql, { timeout: 30000 });
      
      if (result.success && result.rows && result.rows.length > 0) {
        const batchSuccessCount = parseInt(result.rows[0].success_count) || 0;
        results.successCount += batchSuccessCount;
        
        if (batchSuccessCount < batch.length) {
          results.errorCount += (batch.length - batchSuccessCount);
          results.errors.push(`${batch.length - batchSuccessCount} records failed in batch ${Math.floor(i / maxBatchSize) + 1}`);
        }
      } else {
        results.errorCount += batch.length;
        results.errors.push(`Batch ${Math.floor(i / maxBatchSize) + 1} failed: ${result.message || 'Unknown error'}`);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error in batchImportMemberQuery:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

function deduplicateMembers(members: Member[]): Member[] {
  const uniqueMembersMap = new Map<string, Member>();
  
  for (let i = members.length - 1; i >= 0; i--) {
    const member = members[i];
    if (member.member_id) {
      uniqueMembersMap.set(member.member_id, member);
    }
  }
  
  return Array.from(uniqueMembersMap.values());
}
