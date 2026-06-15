// Migración puntual: añade la columna avatarUrl a User (idempotente), por 443.
import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;');
  console.log("✅ columna avatarUrl añadida (o ya existía)");
} catch (e) {
  console.error("❌ falló:", (e as Error).message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
