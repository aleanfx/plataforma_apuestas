// Crea la tabla SystemSetting (por HTTPS/443, sin prisma db push).
// Ejecutar: npx tsx prisma/create-settings-table.ts

import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "SystemSetting" (
        "key" TEXT PRIMARY KEY,
        "value" TEXT NOT NULL
      );
    `);
    console.log("✅ Tabla SystemSetting creada (o ya existía).");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
