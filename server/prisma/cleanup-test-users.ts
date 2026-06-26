// Limpia los usuarios de PRUEBA (correos @betmarplay.test creados por la suite
// e2e y el modo práctica). Borra en cascada cuenta/ledger/solicitudes/tokens.
// Uso:
//   npx tsx prisma/cleanup-test-users.ts          (dry-run: solo cuenta)
//   npx tsx prisma/cleanup-test-users.ts --apply   (borra de verdad)

import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const TEST_PATTERN = "%@betmarplay.test";

async function main() {
  const apply = process.argv.includes("--apply");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const test = await pool.query(`SELECT count(*)::int AS n FROM "User" WHERE "email" LIKE $1`, [TEST_PATTERN]);
    const total = await pool.query(`SELECT count(*)::int AS n FROM "User"`);
    console.log(`Usuarios de prueba (@betmarplay.test): ${test.rows[0].n} de ${total.rows[0].n} totales.`);

    if (apply) {
      const del = await pool.query(
        `DELETE FROM "User" WHERE "email" LIKE $1 AND "role" <> 'admin' RETURNING id`,
        [TEST_PATTERN],
      );
      console.log(`🗑️  Eliminados ${del.rowCount} usuarios de prueba (con su cuenta/ledger en cascada).`);
    } else {
      console.log('Dry-run (no se borró nada). Para borrarlos: npx tsx prisma/cleanup-test-users.ts --apply');
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
