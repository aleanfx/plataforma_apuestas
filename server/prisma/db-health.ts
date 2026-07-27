// Chequeo rápido de salud de la base de datos (Neon, por HTTPS/443).
// Uso: npx tsx prisma/db-health.ts

import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

async function main() {
  const started = Date.now();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const host = (process.env.DATABASE_URL ?? "").split("@")[1]?.split("/")[0] ?? "?";
    const q = async (sql: string, params: unknown[] = []) => (await pool.query(sql, params)).rows[0];

    const total = await q(`SELECT count(*)::int AS n FROM "User"`);
    const real = await q(`SELECT count(*)::int AS n FROM "User" WHERE "email" NOT LIKE '%@betmarplay.test'`);
    const admins = await q(`SELECT count(*)::int AS n FROM "User" WHERE "role" = 'admin'`);
    const ledger = await q(`SELECT count(*)::int AS n FROM "LedgerEntry"`);
    const pendDep = await q(`SELECT count(*)::int AS n FROM "DepositRequest" WHERE "status" = 'pending'`);
    const pendWd = await q(`SELECT count(*)::int AS n FROM "WithdrawRequest" WHERE "status" = 'pending'`);
    const bal = await q(`SELECT COALESCE(SUM("balance"), 0)::text AS s FROM "Account"`);
    // Integridad: la suma del ledger de cada cuenta debe coincidir con su balance.
    const drift = await q(`
      SELECT count(*)::int AS n FROM (
        SELECT a."id", a."balance", COALESCE(SUM(l."delta"), 0) AS suma
        FROM "Account" a LEFT JOIN "LedgerEntry" l ON l."accountId" = a."id"
        GROUP BY a."id", a."balance"
        HAVING a."balance" <> COALESCE(SUM(l."delta"), 0)
      ) x
    `);

    console.log(`✅ DB accesible (${Date.now() - started} ms) · host: ${host}`);
    console.log(`   Usuarios: ${total.n} totales · ${real.n} reales · ${admins.n} admin`);
    console.log(`   Ledger: ${ledger.n} movimientos · saldo total: ${bal.s} céntimos`);
    console.log(`   Pendientes: ${pendDep.n} depósitos · ${pendWd.n} retiros`);
    console.log(
      drift.n === 0
        ? "   Integridad contable: OK (ledger == balance en todas las cuentas)"
        : `   ⚠️  Integridad contable: ${drift.n} cuenta(s) con descuadre`,
    );
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("❌ DB no accesible:", err);
  process.exit(1);
});
