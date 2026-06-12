// Prueba end-to-end del flujo de auth contra el server vivo (localhost:4000) + Neon real.
// Limpia los usuarios de prueba al final. Correr con el server arrancado.
import { prisma } from "../src/db.js";
import { env } from "../src/env.js";

const BASE = "http://localhost:4000";
let passed = 0;
let failed = 0;

function check(name: string, cond: boolean, extra?: unknown) {
  if (cond) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}`, extra ?? "");
  }
}

async function post(path: string, body: unknown, token?: string) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json().catch(() => null) } as {
    status: number;
    data: any;
  };
}

async function get(path: string, token?: string) {
  const res = await fetch(BASE + path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return { status: res.status, data: await res.json().catch(() => null) } as {
    status: number;
    data: any;
  };
}

async function main() {
  const email = `test_${Date.now()}@betmarplay.test`;
  const adminEmail = env.ADMIN_EMAIL.toLowerCase();

  console.log("\n--- Registro ---");
  const reg = await post("/auth/register", { email, name: "Test User", password: "secret123" });
  check("register devuelve 201", reg.status === 201, reg.status);
  check("rol = user", reg.data?.user?.role === "user");
  check("balance inicial 0", reg.data?.user?.balance === 0);
  check("devuelve access y refresh", !!reg.data?.access && !!reg.data?.refresh);

  console.log("\n--- Registro duplicado ---");
  const dup = await post("/auth/register", { email, name: "Otro", password: "secret123" });
  check("duplicado devuelve 409", dup.status === 409, dup.status);

  console.log("\n--- Validación ---");
  const bad = await post("/auth/register", { email: "no-es-email", name: "x", password: "123" });
  check("datos inválidos devuelve 400", bad.status === 400, bad.status);

  console.log("\n--- Login ---");
  const badLogin = await post("/auth/login", { email, password: "incorrecta" });
  check("login con clave mala devuelve 401", badLogin.status === 401, badLogin.status);
  const login = await post("/auth/login", { email, password: "secret123" });
  check("login correcto devuelve 200", login.status === 200, login.status);
  const access = login.data?.access as string;
  const refresh = login.data?.refresh as string;

  console.log("\n--- /me ---");
  const me = await get("/auth/me", access);
  check("/me con token devuelve el usuario", me.data?.user?.email === email, me.data);
  const noAuth = await get("/auth/me");
  check("/me sin token devuelve 401", noAuth.status === 401, noAuth.status);
  const badAuth = await get("/auth/me", "token-basura");
  check("/me con token inválido devuelve 401", badAuth.status === 401, badAuth.status);

  console.log("\n--- Refresh (rotación) ---");
  const ref = await post("/auth/refresh", { refreshToken: refresh });
  check("refresh devuelve nuevos tokens", !!ref.data?.access && !!ref.data?.refresh, ref.status);
  const reuse = await post("/auth/refresh", { refreshToken: refresh });
  check("refresh viejo ya no sirve (rotado)", reuse.status === 401, reuse.status);

  console.log("\n--- Logout ---");
  const out = await post("/auth/logout", { refreshToken: ref.data.refresh });
  check("logout devuelve ok", out.data?.ok === true);
  const afterOut = await post("/auth/refresh", { refreshToken: ref.data.refresh });
  check("refresh tras logout devuelve 401", afterOut.status === 401, afterOut.status);

  console.log("\n--- Rol admin ---");
  const adminReg = await post("/auth/register", {
    email: adminEmail,
    name: "Admin Test",
    password: "secret123",
  });
  // Puede ya existir si lo registraste antes; en ese caso 409 y verificamos por DB.
  if (adminReg.status === 201) {
    check("email admin obtiene rol admin", adminReg.data?.user?.role === "admin", adminReg.data);
  } else {
    const dbUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    check("email admin tiene rol admin (en DB)", dbUser?.role === "admin", dbUser?.role);
  }

  // --- Limpieza: borra el usuario de prueba y el admin de prueba SOLO si lo creamos aquí ---
  console.log("\n--- Limpieza ---");
  await prisma.user.deleteMany({ where: { email } });
  if (adminReg.status === 201) {
    await prisma.user.deleteMany({ where: { email: adminEmail } });
    console.log("  (admin de prueba eliminado; regístralo de verdad desde la app)");
  }

  console.log(`\nRESULTADO: ${passed} ✅ / ${failed} ❌\n`);
  await prisma.$disconnect();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
