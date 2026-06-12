// Prueba del Módulo 6 (Póker): side pots + evaluación de manos + mano completa e2e.
// Verifica conservación de fichas en la mesa y de dinero en las billeteras.
import { io, type Socket } from "socket.io-client";
import { prisma } from "../src/db.js";
import { applyLedger } from "../src/wallet/ledger.js";
import { balanceOf } from "../src/realtime/escrow.js";
import { computeSidePots } from "../src/games/poker/sidepots.js";
import { winnersAmong } from "../src/games/poker/handeval.js";

const BASE = "http://localhost:4000";
let passed = 0, failed = 0;
const check = (n: string, c: boolean, e?: unknown) => {
  if (c) { passed++; console.log(`  ✅ ${n}`); } else { failed++; console.log(`  ❌ ${n}`, e ?? ""); }
};
const sortedEq = (a: string[], b: string[]) => a.slice().sort().join() === b.slice().sort().join();

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
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function testSidePots() {
  console.log("\n--- Side pots (lógica pura) ---");
  const p1 = computeSidePots(new Map([["A", 100], ["B", 100]]), new Set());
  check("pozo simple: 1 pozo de 200 con A,B", p1.length === 1 && p1[0].amount === 200 && sortedEq(p1[0].eligible, ["A", "B"]), p1);

  const p2 = computeSidePots(new Map([["A", 50], ["B", 150], ["C", 150]]), new Set());
  check("all-in: main 150 (A,B,C) + side 200 (B,C)",
    p2.length === 2 && p2[0].amount === 150 && sortedEq(p2[0].eligible, ["A", "B", "C"]) &&
    p2[1].amount === 200 && sortedEq(p2[1].eligible, ["B", "C"]), p2);

  const p3 = computeSidePots(new Map([["A", 100], ["B", 100], ["C", 100]]), new Set(["A"]));
  check("aportante retirado: 1 pozo 300 elegibles B,C", p3.length === 1 && p3[0].amount === 300 && sortedEq(p3[0].eligible, ["B", "C"]), p3);
}

function testHandEval() {
  console.log("\n--- Evaluación de manos ---");
  const w = winnersAmong([{ id: "A", hole: ["As", "Ks"] }, { id: "B", hole: ["2c", "3d"] }], ["Qs", "Js", "Ts", "4h", "7d"]);
  check("escalera real de A gana", sortedEq(w, ["A"]), w);
  const tie = winnersAmong([{ id: "A", hole: ["2c", "3d"] }, { id: "B", hole: ["2h", "3s"] }], ["As", "Ks", "Qd", "Jc", "Th"]);
  check("mismo board -> empate (split)", sortedEq(tie, ["A", "B"]), tie);
}

async function main() {
  testSidePots();
  testHandEval();

  const ts = Date.now();
  const ea = `pkA_${ts}@betmarplay.test`, eb = `pkB_${ts}@betmarplay.test`;
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
  const { tableId } = (await rest("POST", "/dev/poker-table", tA, { seats: 2, buyIn: 10000, smallBlind: 50, bigBlind: 100 })).data;
  await emit(sa, "table:join", { tableId });
  await emit(sb, "table:join", { tableId });

  console.log("\n--- Buy-in ---");
  await emit(sa, "table:action", { tableId, action: { type: "buyin" } });
  await emit(sb, "table:action", { tableId, action: { type: "buyin" } });
  check("buy-in debita la billetera (90000 c/u)", (await balanceOf(idA)) === 90000 && (await balanceOf(idB)) === 90000);

  // Bots: pasan si pueden, si no igualan (la mano llega a showdown).
  let stop = false;
  // Bot con "pump": guarda el último estado y reprocesa al terminar, para no
  // perder eventos que llegan mientras está esperando un ack.
  const bot = (s: Socket) => {
    let latest: any = null;
    let busy = false;
    async function pump() {
      if (busy || stop) return;
      const g = latest;
      if (!g || !g.myTurn || !g.actions) return;
      busy = true;
      const move = g.actions.canCheck ? "check" : g.actions.canCall ? "call" : "fold";
      await emit(s, "table:action", { tableId, action: { type: move } });
      busy = false;
      void pump();
    }
    s.on("table:state", (p: any) => {
      latest = p.game;
      void pump();
    });
  };

  console.log("\n--- Mano completa (showdown) ---");
  const showdown = waitState(sa, (g) => !g.handActive && Array.isArray(g.showdown) && g.showdown.length > 0 && g.showdown.some((x: any) => x.hand));
  bot(sa); bot(sb);
  // Re-join fuerza un broadcast del estado actual y arranca a los bots.
  await emit(sa, "table:join", { tableId });
  const fin = (await showdown).game;
  const chipsSum = fin.seats.reduce((s: number, x: any) => s + x.chips, 0);
  check("conservación de fichas en la mesa (== 20000)", chipsSum === 20000, { chipsSum, seats: fin.seats.map((x: any) => x.chips) });
  check("hubo ganador del pozo", fin.showdown.some((x: any) => x.amount > 0), fin.showdown);
  check("se revelan las manos en el showdown", fin.showdown.every((x: any) => typeof x.hand === "string"));

  console.log("\n--- Retiro (cash-out) y conservación de dinero ---");
  stop = true;
  sa.removeAllListeners("table:state");
  sb.removeAllListeners("table:state");
  await emit(sa, "table:leave", { tableId });
  await emit(sb, "table:leave", { tableId });
  await sleep(1500); // deja que los payouts asíncronos se asienten

  const balA = await balanceOf(idA), balB = await balanceOf(idB);
  check("dinero total conservado (== 200000)", balA + balB === 200000, { balA, balB });
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
