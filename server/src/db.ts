import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

import { env } from "./env.js";

// El entorno solo permite egress HTTP/HTTPS (puerto 443). El protocolo Postgres
// nativo (5432) está bloqueado, así que usamos el driver serverless de Neon, que
// habla con la base por WebSocket/HTTPS sobre 443. Esto funciona igual en local,
// en este entorno y en producción (Fly.io).
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaNeon(pool);

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
});
