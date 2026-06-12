// Aplica prisma/init.sql contra Neon por WebSocket/HTTPS (puerto 443).
// Se usa porque `prisma db push`/`migrate` requieren el puerto 5432 (a veces bloqueado).
import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const here = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(here, "init.sql"), "utf8");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query(sql);
  console.log("✅ init.sql aplicado contra Neon");
} catch (e) {
  console.error("❌ Falló la aplicación del DDL:", (e as Error).message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
