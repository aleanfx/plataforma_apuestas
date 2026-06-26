import "dotenv/config";
import { z } from "zod";

// Configuración validada al arrancar. Si falta algo crítico, el server no levanta.
const schema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ADMIN_EMAIL: z.string().email(),
  // Admins adicionales (lista separada por comas). Opcional.
  ADMIN_EMAILS: z.string().optional(),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  PORT: z.coerce.number().default(4000),
  BS_PER_USD: z.coerce.number().default(40),
  // Client ID de Google (OAuth) para "Iniciar sesión con Google". Es público;
  // se puede sobreescribir con la variable GOOGLE_CLIENT_ID en Render.
  GOOGLE_CLIENT_ID: z
    .string()
    .default("218078853182-ui9cp46ca9li4t73tqq9v82rraf8027g.apps.googleusercontent.com"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Configuración inválida en .env:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

// Admins por defecto del proyecto (además de ADMIN_EMAIL y ADMIN_EMAILS del entorno).
const DEFAULT_ADMIN_EMAILS = ["betm4r@gmail.com", "gutierrezalejandro551@gmail.com"];

const adminEmails = new Set(
  [parsed.data.ADMIN_EMAIL, ...(parsed.data.ADMIN_EMAILS ?? "").split(","), ...DEFAULT_ADMIN_EMAILS]
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean),
  adminEmails,
};

/** ¿Este correo debe tener rol admin? */
export function isAdminEmail(email: string): boolean {
  return adminEmails.has(email.trim().toLowerCase());
}
