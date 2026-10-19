import pg from "pg";
const user_db = new pg.Client(process.env.DATABASE_URL);
export default user_db;