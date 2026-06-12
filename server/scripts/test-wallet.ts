// Prueba e2e de la billetera + ledger contra el server vivo + Neon real.
// Cubre depósito/retiro, aprobaciones, invariante contable y concurrencia.
// Limpia los usuarios de prueba al final.
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

async function req(method: string, path: string, token?: string, body?: unknown) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: (await res.json().catch(() => null)) as any };
}

async function balanceOf(userId: string): Promise<number> {
  const acc = await prisma.account.findUnique({ where: { userId } });
  return Number(acc!.balance);
}

async function ledgerSum(userId: string): Promise<number> {
  const entries = await prisma.ledgerEntry.findMany({ where: { userId } });
  return entries.reduce((s, e) => s + Number(e.delta), 0);
}

async function main() {
  const email = `wallet_${Date.now()}@betmarplay.test`;
  const adminEmail = env.ADMIN_EMAIL.toLowerCase();

  // Usuario normal
  const reg = await req("POST", "/auth/register", undefined, {
    email,
    name: "Wallet User",
    password: "secret123",
  });
  const token = reg.data.access as string;
  const userId = reg.data.user.id as string;

  // Admin (lo creamos para las aprobaciones y lo borramos al final)
  const adminReg = await req("POST", "/auth/register", undefined, {
    email: adminEmail,
    name: "Admin Test",
    password: "secret123",
  });
  const adminCreatedHere = adminReg.status === 201;
  let adminToken = adminReg.data?.access as string;
  if (!adminCreatedHere) {
    // ya existía: no sabemos su clave -> no podemos probar aprobaciones. Abortar limpio.
    console.log("  ⚠️  El admin ya existe; borra ese usuario o usa una DB limpia para esta prueba.");
    await prisma.user.deleteMany({ where: { email } });
    process.exit(1);
  }

  console.log("\n--- Depósito ---");
  const dep = await req("POST", "/wallet/deposit", token, { method: "pagomovil", amount: 50000 });
  check("solicitud de depósito 201", dep.status === 201, dep.status);
  check("saldo sigue en 0 (pendiente)", (await balanceOf(userId)) === 0);

  console.log("\n--- Aprobación de depósito ---");
  const pend = await req("GET", "/admin/requests", adminToken);
  check("admin ve la solicitud en la cola", pend.data.requests.some((r: any) => r.id === dep.data.id));
  const appr = await req("POST", `/admin/deposits/${dep.data.id}/approve`, adminToken);
  check("aprobar depósito 200", appr.status === 200, appr.status);
  check("saldo acreditado = 50000", (await balanceOf(userId)) === 50000);
  const apprAgain = await req("POST", `/admin/deposits/${dep.data.id}/approve`, adminToken);
  check("re-aprobar devuelve 409 (idempotente)", apprAgain.status === 409, apprAgain.status);

  console.log("\n--- Retiro (retención inmediata) ---");
  const wd = await req("POST", "/wallet/withdraw", token, {
    method: "pagomovil",
    amount: 20000,
    destination: "0426 123 4567",
  });
  check("solicitud de retiro 201", wd.status === 201, wd.status);
  check("saldo debitado de inmediato = 30000", (await balanceOf(userId)) === 30000);

  console.log("\n--- Retiro por encima del saldo ---");
  const wdBig = await req("POST", "/wallet/withdraw", token, {
    method: "pagomovil",
    amount: 999999,
    destination: "x",
  });
  check("retiro sin saldo devuelve 400", wdBig.status === 400, wdBig.status);
  check("saldo intacto tras retiro fallido = 30000", (await balanceOf(userId)) === 30000);

  console.log("\n--- Rechazo de retiro (reintegro) ---");
  const rej = await req("POST", `/admin/withdrawals/${wd.data.id}/reject`, adminToken);
  check("rechazar retiro 200", rej.status === 200, rej.status);
  check("saldo reintegrado = 50000", (await balanceOf(userId)) === 50000);

  console.log("\n--- Aprobación de retiro ---");
  const wd2 = await req("POST", "/wallet/withdraw", token, {
    method: "binance",
    amount: 10000,
    destination: "binance-id",
  });
  const wapp = await req("POST", `/admin/withdrawals/${wd2.data.id}/approve`, adminToken);
  check("aprobar retiro 200", wapp.status === 200, wapp.status);
  check("saldo tras retiro aprobado = 40000", (await balanceOf(userId)) === 40000);

  console.log("\n--- Invariante contable (suma ledger == balance) ---");
  check("ledger cuadra con balance", (await ledgerSum(userId)) === (await balanceOf(userId)), {
    ledger: await ledgerSum(userId),
    balance: await balanceOf(userId),
  });

  console.log("\n--- Historial ---");
  const txs = await req("GET", "/wallet/transactions", token);
  check("historial tiene movimientos", txs.data.transactions.length >= 4, txs.data.transactions.length);

  console.log("\n--- Concurrencia (sin doble gasto) ---");
  // saldo actual 40000; dos retiros simultáneos de 30000 -> solo uno debe pasar.
  const [a, b] = await Promise.all([
    req("POST", "/wallet/withdraw", token, { method: "pagomovil", amount: 30000, destination: "0426 111 1111" }),
    req("POST", "/wallet/withdraw", token, { method: "pagomovil", amount: 30000, destination: "0426 222 2222" }),
  ]);
  const ok = [a, b].filter((r) => r.status === 201).length;
  check("solo 1 de 2 retiros concurrentes pasa", ok === 1, {
    a: { status: a.status, body: a.data },
    b: { status: b.status, body: b.data },
  });
  const finalBal = await balanceOf(userId);
  check("saldo final = 10000 (nunca negativo)", finalBal === 10000, finalBal);
  check("invariante se mantiene tras concurrencia", (await ledgerSum(userId)) === finalBal);

  console.log("\n--- Autorización ---");
  const forbidden = await req("GET", "/admin/requests", token); // user normal
  check("usuario normal no entra a /admin (403)", forbidden.status === 403, forbidden.status);

  // Limpieza
  console.log("\n--- Limpieza ---");
  await prisma.user.deleteMany({ where: { email } });
  await prisma.user.deleteMany({ where: { email: adminEmail } });
  console.log("  (usuarios de prueba eliminados)");

  console.log(`\nRESULTADO: ${passed} ✅ / ${failed} ❌\n`);
  await prisma.$disconnect();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
