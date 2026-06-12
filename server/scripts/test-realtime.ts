// Prueba e2e del núcleo de tiempo real (Módulo 3): escrow + sockets.
// Requiere el server vivo (NODE_ENV != production, usa /dev/test-table).
import { io, type Socket } from "socket.io-client";
import { prisma } from "../src/db.js";
import { env } from "../src/env.js";
import { chargeStake, payout, balanceOf } from "../src/realtime/escrow.js";
import { applyLedger } from "../src/wallet/ledger.js";

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

async function rest(method: string, path: string, token?: string, body?: unknown) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: (await res.json().catch(() => null)) as any };
}

function connect(token: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const s = io(BASE, { transports: ["websocket"], auth: { token }, forceNew: true });
    s.on("connect", () => resolve(s));
    s.on("connect_error", (e) => reject(e));
  });
}

function waitFor(s: Socket, event: string, timeoutMs = 3000): Promise<any> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout esperando ${event}`)), timeoutMs);
    s.once(event, (payload) => {
      clearTimeout(t);
      resolve(payload);
    });
  });
}

function emit(s: Socket, event: string, data: unknown): Promise<any> {
  // Con timeout: si el server no responde con ack, no colgamos para siempre.
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve({ _timeout: true }), 3000);
    s.emit(event, data, (res: unknown) => {
      clearTimeout(t);
      resolve(res);
    });
  });
}

async function main() {
  const emailA = `rtA_${Date.now()}@betmarplay.test`;
  const emailB = `rtB_${Date.now()}@betmarplay.test`;

  const regA = await rest("POST", "/auth/register", undefined, { email: emailA, name: "Ana", password: "secret123" });
  const regB = await rest("POST", "/auth/register", undefined, { email: emailB, name: "Beto", password: "secret123" });
  const tokenA = regA.data.access, tokenB = regB.data.access;
  const idA = regA.data.user.id as string;

  // Dar saldo a Ana directamente por el ledger (más simple que pasar por admin).
  const accA = await prisma.account.findUnique({ where: { userId: idA } });
  await prisma.$transaction((tx) =>
    applyLedger(tx, { accountId: accA!.id, userId: idA, delta: 100000n, type: "deposit", note: "Saldo de prueba" }),
  );

  console.log("\n--- Escrow (directo, vía ledger) ---");
  await chargeStake(idA, 5000, "tabla-x");
  check("chargeStake debita el saldo", (await balanceOf(idA)) === 95000, await balanceOf(idA));
  await payout(idA, 3000, "ronda-x");
  check("payout acredita el saldo", (await balanceOf(idA)) === 98000, await balanceOf(idA));
  let threw = false;
  try {
    await chargeStake(idA, 999999, "tabla-y");
  } catch {
    threw = true;
  }
  check("chargeStake sin saldo lanza", threw);
  check("saldo intacto tras cobro fallido", (await balanceOf(idA)) === 98000);

  console.log("\n--- Auth del socket ---");
  let rejected = false;
  try {
    await connect("token-basura");
  } catch {
    rejected = true;
  }
  check("rechaza token inválido", rejected);

  const sa = await connect(tokenA);
  const sb = await connect(tokenB);
  check("conecta con token válido (A y B)", sa.connected && sb.connected);

  console.log("\n--- Mesa: join y presencia ---");
  const { tableId } = (await rest("POST", "/dev/test-table", tokenA, { stake: 5000 })).data;

  const aState = waitFor(sa, "table:state");
  const joinA = await emit(sa, "table:join", { tableId });
  check("A se une (ack ok)", joinA?.ok === true, joinA);
  const sA1 = await aState;
  check("A recibe estado con 1 miembro", sA1.table.members.length === 1, sA1.table.members.length);
  check("estado personalizado (you == A)", sA1.game.you === idA);

  const bState = waitFor(sb, "table:state");
  await emit(sb, "table:join", { tableId });
  const sB1 = await bState;
  check("B ve 2 miembros al unirse", sB1.table.members.length === 2, sB1.table.members.length);

  console.log("\n--- Acción de juego (broadcast) ---");
  const aAfterInc = waitFor(sa, "table:state");
  await emit(sb, "table:action", { tableId, action: { type: "increment" } });
  const sA2 = await aAfterInc;
  check("A ve el count actualizado por acción de B", sA2.game.count === 1, sA2.game.count);

  console.log("\n--- Acción con escrow (charge desde socket) ---");
  await emit(sa, "table:action", { tableId, action: { type: "charge" } });
  check("charge vía socket debita a A", (await balanceOf(idA)) === 93000, await balanceOf(idA));

  console.log("\n--- Presencia / reconexión ---");
  const bSeesOffline = waitFor(sb, "table:state");
  sa.disconnect();
  const sB2 = await bSeesOffline;
  const aMember = sB2.table.members.find((m: any) => m.id === idA);
  check("B ve a A como desconectado", aMember?.connected === false, aMember);

  const sa2 = await connect(tokenA);
  const rejoinable = await waitFor(sa2, "table:rejoinable");
  check("al reconectar, A recibe sus mesas (rejoinable)", rejoinable.tableIds.includes(tableId));
  const bSeesOnline = waitFor(sb, "table:state");
  await emit(sa2, "table:join", { tableId });
  const sB3 = await bSeesOnline;
  const aMember2 = sB3.table.members.find((m: any) => m.id === idA);
  check("B ve a A reconectado", aMember2?.connected === true);

  console.log("\n--- Salir de la mesa ---");
  const aSeesLeave = waitFor(sa2, "table:state");
  sb.emit("table:leave", { tableId });
  const sA3 = await aSeesLeave;
  check("A ve que B salió (1 miembro)", sA3.table.members.length === 1, sA3.table.members.length);

  // Limpieza
  sa2.disconnect();
  sb.disconnect();
  await prisma.user.deleteMany({ where: { email: { in: [emailA, emailB] } } });

  console.log(`\nRESULTADO: ${passed} ✅ / ${failed} ❌\n`);
  await prisma.$disconnect();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
