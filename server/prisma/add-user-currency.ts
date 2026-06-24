// Añade la columna currency a la tabla User (por HTTPS/443, sin prisma db push).
// Ejecutar: npx tsx prisma/add-user-currency.ts

import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "currency" TEXT;
    `);
    console.log("✅ Columna currency añadida a la tabla User (o ya existía).");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
