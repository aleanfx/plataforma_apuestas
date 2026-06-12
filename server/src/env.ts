import "dotenv/config";
import { z } from "zod";

// Configuración validada al arrancar. Si falta algo crítico, el server no levanta.
const schema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ADMIN_EMAIL: z.string().email(),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  PORT: z.coerce.number().default(4000),
  BS_PER_USD: z.coerce.number().default(40),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Configuración inválida en .env:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean),
};
