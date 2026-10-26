import db from "#db/client"

export async function getBattlers(){
    const sql = `SELECT id, name, image_url FROM battlers`;
    const {rows:battlers }= await db.query(sql);
    console.log(battlers)
    return battlers;    
}

export async function getBattlerById(battlerId){
    const sql =`SELECT id, name, image_url FROM battlers WHERE id = $1`;
    const {rows:[battler]} = await db.query(sql, [battlerId])
    return battler;
}