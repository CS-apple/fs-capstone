import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// 1. Explicitly check Render's absolute secret location first
if (fs.existsSync("/etc/secrets/.env")) {
  dotenv.config({ path: "/etc/secrets/.env" });
} else {
  // 2. Fallback to local .env (or project root .env) for development
  dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
  dotenv.config(); // fallback default check
}

import app from "#app";
import db from "#db/client";

const PORT = process.env.PORT ?? 3000;

async function startServer() {
  try {
    await db.connect();
    console.log("Database connected successfully!");

    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}...`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to database:", err);
    process.exit(1);
  }
}

startServer();