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