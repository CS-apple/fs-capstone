import db from "#db/client"
import bcrypt from "bcrypt"

export async function createUser(username, password){
    const sql =`
    INSERT INTO users(username, password) VALUES ($1,$2) RETURNING id, username
    `;
    const hashedPassword = await bcrypt.hash(password, 10);
    const {rows: [user]} = await db.query(sql, [username, hashedPassword])
    // console.log(user)
    return user;
}

//GET USER WITH USERNAME AND

export async function getUserWithUsernameAndPassword(username, password){
// check if user is in db, if so 
    // hash password and compare to db hash
        // if no match, reuturn null
//else return null
// return user
const sql = `
SELECT * from users WHERE username = $1
`;
const {rows: [user]} = await db.query(sql, [username])
if (!user) return null
console.log(user)
const isValid = await bcrypt.compare(password, user.password)
console.log(isValid)
if (!isValid) return null;
return user
};


//GET USER BY ID 
export async function getUserById(id){
const sql = `
SELECT * FROM users WHERE id = $1
`;

const {rows: [user]} = await db.query(sql, [id])
if (!user) return null
return user
};