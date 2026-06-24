// Añade la columna proofUrl a DepositRequest (por HTTPS/443, sin prisma db push).
// Ejecutar: npx tsx prisma/add-deposit-proof.ts

import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(`
      ALTER TABLE "DepositRequest" ADD COLUMN IF NOT EXISTS "proofUrl" TEXT;
    `);
    console.log("✅ Columna proofUrl añadida a DepositRequest (o ya existía).");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
