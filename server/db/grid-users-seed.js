import db from "#db/client";
import { createUser } from "#db/queries/grid-users";

await db.connect();
await seedUsers();
await db.end();
console.log("🌱 Database seeded.");

async function seedUsers(){
    const user = await createUser("user_one", "password")
}