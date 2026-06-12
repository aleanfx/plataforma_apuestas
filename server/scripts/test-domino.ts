// Prueba del Módulo 5 (Dominó): lógica de fichas + partida completa e2e por sockets.
// Ambos clientes juegan como bots (siempre una jugada legal) hasta dominó/tranque.
import { io, type Socket } from "socket.io-client";
import { prisma } from "../src/db.js";
import { applyLedger } from "../src/wallet/ledger.js";
import { balanceOf } from "../src/realtime/escrow.js";
import { fullSet, starterTile, playableEnds, pip } from "../src/games/domino/tiles.js";

const BASE = "http://localhost:4000";
let passed = 0;
let failed = 0;
const check = (n: string, c: boolean, e?: unknown) => {
  if (c) { passed++; console.log(`  ✅ ${n}`); } else { failed++; console.log(`  ❌ ${n}`, e ?? ""); }
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
    const t = setTimeout(() => resolve({ _timeout: true }), 4000);
    s.emit(ev, data, (r: unknown) => { clearTimeout(t); resolve(r); });
  });
function waitState(s: Socket, pred: (g: any) => boolean, timeoutMs = 15000) {
  return new Promise<any>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout esperando estado")), timeoutMs);
    const h = (p: any) => { if (pred(p.game)) { clearTimeout(t); s.off("table:state", h); resolve(p); } };
    s.on("table:state", h);
  });
}

// Bot: cuando es su turno, juega un movimiento legal o pasa.
function attachBot(s: Socket, tableId: string) {
  let busy = false;
  s.on("table:state", async (p: any) => {
    const g = p.game;
    if (g.phase !== "playing" || !g.myTurn || busy) return;
    busy = true;
    if (g.mustPass) {
      await emit(s, "table:action", { tableId, action: { type: "pass" } });
    } else {
      const mv = g.myLegalMoves[0];
      await emit(s, "table:action", { tableId, action: { type: "play", tileId: mv.tileId, end: mv.ends[0] } });
    }
    busy = false;
  });
}

function testTiles() {
  console.log("\n--- Fichas (lógica pura) ---");
  const set = fullSet();
  check("28 fichas", set.length === 28);
  check("todas distintas", new Set(set.map((t) => t.id)).size === 28);
  check("ficha de salida = doble más alto", starterTile(set).id === "6-6");
  check("salida sin dobles = mayor puntaje", starterTile([{ id: "5-6", a: 5, b: 6 }, { id: "2-3", a: 2, b: 3 }]).id === "5-6");
  check("playableEnds detecta extremos", playableEnds({ id: "3-5", a: 3, b: 5 }, 3, 1).join() === "left");
  check("pip suma correcta", pip({ id: "4-6", a: 4, b: 6 }) === 10);
}

async function main() {
  testTiles();

  const ts = Date.now();
  const ea = `domA_${ts}@betmarplay.test`, eb = `domB_${ts}@betmarplay.test`;
  const ra = await rest("POST", "/auth/register", undefined, { email: ea, name: "Ana", password: "secret123" });
  const rb = await rest("POST", "/auth/register", undefined, { email: eb, name: "Beto", password: "secret123" });
  const tA = ra.data.access, tB = rb.data.access;
  const idA = ra.data.user.id as string, idB = rb.data.user.id as string;
  for (const id of [idA, idB]) {
    const acc = await prisma.account.findUnique({ where: { userId: id } });
    await prisma.$transaction((tx) =>
      applyLedger(tx, { accountId: acc!.id, userId: id, delta: 100000n, type: "deposit", note: "Saldo de prueba" }),
    );
  }

  const sa = await connect(tA), sb = await connect(tB);
  const { tableId } = (await rest("POST", "/dev/domino-table", tA, { stake: 5000, seats: 2 })).data;
  await emit(sa, "table:join", { tableId });
  await emit(sb, "table:join", { tableId });

  console.log("\n--- Inicio / reparto ---");
  // Estado inicial tras iniciar (para chequear turno) — lo capturamos antes de soltar los bots.
  const playingA = waitState(sa, (g) => g.phase === "playing");
  const startRes = await emit(sa, "table:action", { tableId, action: { type: "start" } });
  check("inicio ok", startRes?.ok === true, startRes);
  const ps = (await playingA).game;
  check("saldos debitados (95000 c/u)", (await balanceOf(idA)) === 95000 && (await balanceOf(idB)) === 95000);
  check("cada jugador tiene 7 fichas", ps.seats.every((s: any) => s.handCount === 7));
  check("hay un turno asignado", ps.turnUserId === idA || ps.turnUserId === idB);

  console.log("\n--- Validación de turno ---");
  // El que NO tiene el turno intenta jugar -> rechazado.
  const offTurnSock = ps.turnUserId === idA ? sb : sa;
  const offTurn = await emit(offTurnSock, "table:action", { tableId, action: { type: "play", tileId: "0-0", end: "left" } });
  check("jugar fuera de turno se rechaza", offTurn?.ok === false, offTurn);

  console.log("\n--- Partida completa (bots) ---");
  const finished = waitState(sa, (g) => g.phase === "finished");
  attachBot(sa, tableId);
  attachBot(sb, tableId);
  // Re-join fuerza un broadcast del estado actual y arranca a los bots.
  await emit(sa, "table:join", { tableId });
  const fin = (await finished).game;

  check("la partida termina (dominó o tranque)", fin.phase === "finished");
  check("hay ganador(es)", fin.winners.length >= 1, fin.winners);
  const paid = fin.winners.reduce((s: number, w: any) => s + w.amount, 0);
  check("pozo repartido == 10000", paid === 10000, { paid, pot: fin.pot });

  const balA = await balanceOf(idA), balB = await balanceOf(idB);
  check("total conservado (200000)", balA + balB === 200000, { balA, balB });
  for (const [id, bal, who] of [[idA, balA, "A"], [idB, balB, "B"]] as const) {
    const entries = await prisma.ledgerEntry.findMany({ where: { userId: id } });
    const sum = entries.reduce((s, e) => s + Number(e.delta), 0);
    check(`invariante de ${who} (ledger == balance)`, sum === bal, { sum, bal });
  }

  sa.disconnect(); sb.disconnect();
  await prisma.user.deleteMany({ where: { email: { in: [ea, eb] } } });
  console.log(`\nRESULTADO: ${passed} ✅ / ${failed} ❌\n`);
  await prisma.$disconnect();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
