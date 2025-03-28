import { executeSql } from '../apiService';
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
