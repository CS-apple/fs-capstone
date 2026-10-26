import db from "#db/client"; 

export async function addCategory([name, categoryType, targetId, parameter, isActive]) {
    const sql = `
        INSERT INTO categories (name, category_type, target_id, parameter, is_active) 
        VALUES ($1, $2, $3, $4, $5)
    `;
const{rows:[category]} = await db.query(sql, [name, categoryType, targetId, parameter, isActive]);
return category
}