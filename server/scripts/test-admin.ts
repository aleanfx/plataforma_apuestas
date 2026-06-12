// Prueba del Módulo 7 (Admin): métricas, usuarios, suspensión y mesas.
import { prisma } from "../src/db.js";
import { env } from "../src/env.js";

const BASE = "http://localhost:4000";
let passed = 0, failed = 0;
const check = (n: string, c: boolean, e?: unknown) => {
  if (c) { passed++; console.log(`  ✅ ${n}`); } else { failed++; console.log(`  ❌ ${n}`, e ?? ""); }
};
async function req(method: string, path: string, token?: string, body?: unknown) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: (await res.json().catch(() => null)) as any };
}

async function main() {
  const adminEmail = env.ADMIN_EMAIL.toLowerCase();
  const userEmail = `adm_u_${Date.now()}@betmarplay.test`;

  const adminReg = await req("POST", "/auth/register", undefined, { email: adminEmail, name: "Admin", password: "secret123" });
  const adminCreated = adminReg.status === 201;
  if (!adminCreated) { console.log("⚠️ admin ya existe; usa DB limpia."); process.exit(1); }
  const adminTok = adminReg.data.access;

  const ureg = await req("POST", "/auth/register", undefined, { email: userEmail, name: "Pepe Prueba", password: "secret123" });
  const userTok = ureg.data.access, userId = ureg.data.user.id;

  console.log("\n--- Métricas ---");
  const metrics = await req("GET", "/admin/metrics", adminTok);
  check("métricas 200", metrics.status === 200, metrics.status);
  check("cuenta usuarios >= 2", metrics.data.users >= 2, metrics.data.users);
  check("incluye balanceTotal y online", typeof metrics.data.balanceTotal === "number" && typeof metrics.data.online === "number");
  const forbidden = await req("GET", "/admin/metrics", userTok);
  check("usuario normal no ve métricas (403)", forbidden.status === 403, forbidden.status);

  console.log("\n--- Usuarios ---");
  const users = await req("GET", "/admin/users", adminTok);
  check("lista incluye al usuario de prueba", users.data.users.some((u: any) => u.id === userId));

  console.log("\n--- Suspensión ---");
  const susp = await req("POST", `/admin/users/${userId}/status`, adminTok, { status: "suspended" });
  check("suspender 200", susp.status === 200, susp.status);
  const loginSusp = await req("POST", "/auth/login", undefined, { email: userEmail, password: "secret123" });
  check("usuario suspendido no puede entrar (403)", loginSusp.status === 403, loginSusp.status);
  const react = await req("POST", `/admin/users/${userId}/status`, adminTok, { status: "active" });
  check("reactivar 200", react.status === 200);
  const loginOk = await req("POST", "/auth/login", undefined, { email: userEmail, password: "secret123" });
  check("usuario reactivado entra (200)", loginOk.status === 200, loginOk.status);

  // No se puede tocar a un admin.
  const adminId = adminReg.data.user.id;
  const touchAdmin = await req("POST", `/admin/users/${adminId}/status`, adminTok, { status: "suspended" });
  check("no se puede suspender a un admin (400)", touchAdmin.status === 400, touchAdmin.status);

  console.log("\n--- Mesas en vivo ---");
  const tables = await req("GET", "/admin/tables", adminTok);
  check("hay mesas fijas (>= 7: bingo/dominó/póker)", tables.data.tables.length >= 7, tables.data.tables.length);

  // Limpieza
  await prisma.user.deleteMany({ where: { email: { in: [adminEmail, userEmail] } } });
  console.log(`\nRESULTADO: ${passed} ✅ / ${failed} ❌\n`);
  await prisma.$disconnect();
  process.exit(failed === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
