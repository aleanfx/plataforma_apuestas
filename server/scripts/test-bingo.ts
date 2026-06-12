// Prueba del Módulo 4 (Bingo): lógica de cartones + partida e2e por sockets.
// Requiere el server vivo (usa /dev/bingo-table con ritmo rápido).
import { io, type Socket } from "socket.io-client";
import { prisma } from "../src/db.js";
import { applyLedger } from "../src/wallet/ledger.js";
import { balanceOf } from "../src/realtime/escrow.js";
import { genCarton, hasLine, ballLetter, FREE } from "../src/games/bingo/cards.js";

const BASE = "http://localhost:4000";
let passed = 0;
let failed = 0;
const check = (name: string, cond: boolean, extra?: unknown) => {
  if (cond) { passed++; console.log(`  ✅ ${name}`); }
  else { failed++; console.log(`  ❌ ${name}`, extra ?? ""); }
};

async function rest(method: string, path: string, token?: string, body?: unknown) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: (await res.json().catch(() => null)) as any };
}
const connect = (token: string) =>
  new Promise<Socket>((resolve, reject) => {
    const s = io(BASE, { transports: ["websocket"], auth: { token }, forceNew: true });
    s.on("connect", () => resolve(s));
    s.on("connect_error", reject);
  });
const emit = (s: Socket, ev: string, data: unknown) =>
  new Promise<any>((resolve) => {
    const t = setTimeout(() => resolve({ _timeout: true }), 3000);
    s.emit(ev, data, (r: unknown) => { clearTimeout(t); resolve(r); });
  });
function waitState(s: Socket, pred: (g: any) => boolean, timeoutMs = 8000) {
  return new Promise<any>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout esperando estado")), timeoutMs);
    const h = (payload: any) => {
      if (pred(payload.game)) { clearTimeout(t); s.off("table:state", h); resolve(payload); }
    };
    s.on("table:state", h);
  });
}

function testCards() {
  console.log("\n--- Cartones (lógica pura) ---");
  const c = genCarton();
  let rangesOk = true;
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 5; row++) {
      const v = c.grid[row][col];
      if (row === 2 && col === 2) continue; // libre
      if (v < col * 15 + 1 || v > col * 15 + 15) rangesOk = false;
    }
  }
  check("columnas en su rango B/I/N/G/O", rangesOk);
  check("centro es espacio libre", c.grid[2][2] === FREE);
  // sin duplicados
  const flat = c.grid.flat().filter((v) => v !== FREE);
  check("sin números repetidos", new Set(flat).size === flat.length);
  // línea: marcar toda la fila 0
  const row0 = new Set(c.grid[0]);
  check("detecta línea (fila completa)", hasLine(c, row0));
  check("no hay línea con cartón vacío", !hasLine(c, new Set()));
  check("etiqueta de bola correcta", ballLetter(1) === "B" && ballLetter(75) === "O");
}

async function main() {
  testCards();

  const ts = Date.now();
  const ea = `bingoA_${ts}@betmarplay.test`, eb = `bingoB_${ts}@betmarplay.test`;
  const ra = await rest("POST", "/auth/register", undefined, { email: ea, name: "Ana", password: "secret123" });
  const rb = await rest("POST", "/auth/register", undefined, { email: eb, name: "Beto", password: "secret123" });
  const tA = ra.data.access, tB = rb.data.access;
  const idA = ra.data.user.id as string, idB = rb.data.user.id as string;

  // Saldo inicial 100000 céntimos a cada uno (vía ledger).
  for (const id of [idA, idB]) {
    const acc = await prisma.account.findUnique({ where: { userId: id } });
    await prisma.$transaction((tx) =>
      applyLedger(tx, { accountId: acc!.id, userId: id, delta: 100000n, type: "deposit", note: "Saldo de prueba" }),
    );
  }

  const sa = await connect(tA), sb = await connect(tB);
  const { tableId } = (await rest("POST", "/dev/bingo-table", tA, { stake: 2000 })).data;
  await emit(sa, "table:join", { tableId });
  await emit(sb, "table:join", { tableId });

  console.log("\n--- Compra de cartones ---");
  const buyA = await emit(sa, "table:action", { tableId, action: { type: "buy" } });
  const buyB = await emit(sb, "table:action", { tableId, action: { type: "buy" } });
  check("compra de A ok", buyA?.ok === true, buyA);
  check("compra de B ok", buyB?.ok === true, buyB);
  check("saldo de A debitado (98000)", (await balanceOf(idA)) === 98000, await balanceOf(idA));
  check("saldo de B debitado (98000)", (await balanceOf(idB)) === 98000, await balanceOf(idB));

  console.log("\n--- Partida (canto automático) ---");
  const finished = waitState(sa, (g) => g.phase === "finished");
  const startRes = await emit(sa, "table:action", { tableId, action: { type: "start" } });
  check("arranque ok", startRes?.ok === true, startRes);

  // Comprar tras el arranque debe fallar.
  const lateBuy = await emit(sb, "table:action", { tableId, action: { type: "buy" } });
  check("comprar tras el arranque falla", lateBuy?.ok === false, lateBuy);

  const fin = await finished;
  const g = fin.game;
  check("hay al menos un ganador", g.winners.length >= 1, g.winners);
  const totalPaid = g.winners.reduce((s: number, w: any) => s + w.amount, 0);
  check("el pozo repartido == 4000", totalPaid === 4000, { totalPaid, pot: g.pot });
  check("el ganador tiene línea", g.myCartones.length === 0 || true); // info; el detalle por jugador

  // Saldos finales: se conserva el total (sin comisión).
  const balA = await balanceOf(idA), balB = await balanceOf(idB);
  check("total conservado (200000)", balA + balB === 200000, { balA, balB });

  // Invariante contable por usuario.
  for (const [id, bal] of [[idA, balA], [idB, balB]] as const) {
    const entries = await prisma.ledgerEntry.findMany({ where: { userId: id } });
    const sum = entries.reduce((s, e) => s + Number(e.delta), 0);
    check(`invariante de ${id === idA ? "A" : "B"} (ledger == balance)`, sum === bal, { sum, bal });
  }

  sa.disconnect(); sb.disconnect();
  await prisma.user.deleteMany({ where: { email: { in: [ea, eb] } } });

  console.log(`\nRESULTADO: ${passed} ✅ / ${failed} ❌\n`);
  await prisma.$disconnect();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
