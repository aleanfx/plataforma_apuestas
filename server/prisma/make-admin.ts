// Promueve uno o más usuarios a rol admin (por HTTPS/443).
// Uso: npx tsx prisma/make-admin.ts correo1@x.com correo2@y.com
// Sin argumentos, usa la lista por defecto de abajo.

import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const DEFAULT = ["gutierrezalejandro551@gmail.com"];

async function main() {
  const emails = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    for (const email of emails) {
      const r = await pool.query(
        `UPDATE "User" SET "role" = 'admin' WHERE lower("email") = lower($1) RETURNING "email", "role"`,
        [email],
      );
      if (r.rowCount && r.rowCount > 0) {
        console.log(`✅ ${email} → admin`);
      } else {
        console.log(`⚠️  No existe un usuario con el correo ${email} (regístralo primero).`);
      }
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
