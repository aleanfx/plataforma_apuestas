// Smoke test contra PRODUCCIÓN (Render en vivo): práctica vs CPU + chat en los 3
// juegos. Crea un usuario desechable (dinero de juguete, sin tocar el ledger) y lo
// borra al final. Uso: npx tsx scripts/smoke-prod.ts
import { io, type Socket } from "socket.io-client";
import { prisma } from "../src/db.js";

const BASE = process.env.SMOKE_BASE ?? "https://betmarplay-server.onrender.com";
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
    const t = setTimeout(() => resolve({ _timeout: true }), 8000);
    s.emit(ev, data, (r: unknown) => { clearTimeout(t); resolve(r); });
  });
function waitState(s: Socket, pred: (g: any) => boolean, timeoutMs: number) {
  return new Promise<any>((resolve) => {
    const t = setTimeout(() => resolve(null), timeoutMs);
    const h = (p: any) => { if (pred(p.game)) { clearTimeout(t); s.off("table:state", h); resolve(p); } };
    s.on("table:state", h);
  });
}
function waitMsg(s: Socket, pred: (m: any) => boolean, timeoutMs: number) {
  return new Promise<any>((resolve) => {
    const t = setTimeout(() => resolve(null), timeoutMs);
    const h = (m: any) => { if (pred(m)) { clearTimeout(t); s.off("table:message", h); resolve(m); } };
    s.on("table:message", h);
  });
}

async function waitHealth() {
  for (let i = 0; i < 25; i++) {
    try {
      const r = await fetch(BASE + "/health", { signal: AbortSignal.timeout(8000) });
      if (r.ok) return true;
    } catch { /* dormido, reintenta */ }
    await new Promise((r) => setTimeout(r, 5000));
  }
  return false;
}

async function main() {
  console.log(`\n🌐 Probando PRODUCCIÓN: ${BASE}`);
  check("servidor responde /health (despierto)", await waitHealth());

  const email = `smokeprod_${Date.now()}@betmarplay.test`;
  const r = await rest("POST", "/auth/register", undefined, { email, name: "Smoke", password: "secret123" });
  check("registro de usuario desechable", (r.status === 200 || r.status === 201) && !!r.data?.access, r.status);
  const token = r.data.access;

  try {
    // ---------- DOMINÓ + CHAT ----------
    console.log("\n--- DOMINÓ (humano + 1 CPU) + chat ---");
    {
      const s = await connect(token);
      const pr = await emit(s, "table:practice", { game: "domino" });
      check("mesa de práctica creada", pr?.ok === true && !!pr.tableId, pr);
      const tableId = pr.tableId;
      await emit(s, "table:join", { tableId });

      // Chat: enviamos y debemos recibir nuestro propio mensaje (broadcast a la sala).
      const gotMsg = waitMsg(s, (m) => m.text === "hola mesa", 8000);
      s.emit("table:chat", { tableId, text: "hola mesa" });
      check("chat en vivo (mensaje recibido)", !!(await gotMsg));

      s.on("table:state", async (p: any) => {
        const g = p.game;
        if (g.phase === "playing" && g.myTurn) {
          if (g.mustPass) await emit(s, "table:action", { tableId, action: { type: "pass" } });
          else if (g.myLegalMoves?.[0]) {
            const mv = g.myLegalMoves[0];
            await emit(s, "table:action", { tableId, action: { type: "play", tileId: mv.tileId, end: mv.ends[0] } });
          }
        }
      });
      await emit(s, "table:action", { tableId, action: { type: "start" } });
      const fin = await waitState(s, (g) => g.phase === "finished", 30000);
      check("la partida termina (el CPU jugó)", !!fin);
      s.disconnect();
    }

    // ---------- PÓKER ----------
    console.log("\n--- PÓKER (humano + 3 CPU) ---");
    {
      const s = await connect(token);
      const pr = await emit(s, "table:practice", { game: "poker" });
      check("mesa de práctica creada", pr?.ok === true && !!pr.tableId, pr);
      const tableId = pr.tableId;
      s.on("table:state", async (p: any) => {
        const g = p.game;
        if (g.myChips === 0 && !g.seats?.[g.mySeat]?.inHand) {
          await emit(s, "table:action", { tableId, action: { type: "buyin" } });
        } else if (g.myTurn && g.actions) {
          const a = g.actions;
          const act = a.canCheck ? "check" : a.canCall && a.callAmount <= (g.bigBlind || 1) * 4 ? "call" : "fold";
          await emit(s, "table:action", { tableId, action: { type: act } });
        }
      });
      await emit(s, "table:join", { tableId });
      const community = await waitState(s, (g) => (g.community?.length ?? 0) >= 3, 25000);
      check("se reparte y avanza una mano (flop)", !!community);
      s.disconnect();
    }

    // ---------- BINGO ----------
    console.log("\n--- BINGO (humano + 4 CPU) ---");
    {
      const s = await connect(token);
      const pr = await emit(s, "table:practice", { game: "bingo" });
      check("mesa de práctica creada", pr?.ok === true && !!pr.tableId, pr);
      const tableId = pr.tableId;
      await emit(s, "table:join", { tableId });
      await emit(s, "table:action", { tableId, action: { type: "buy" } });
      const withBots = await waitState(s, (g) => (g.players?.length ?? 0) >= 3, 10000);
      check("los CPU compraron cartones (>=3 jugadores)", !!withBots);
      const playing = await waitState(s, (g) => g.phase === "playing" && (g.called?.length ?? 0) > 0, 20000);
      check("la ronda arranca y se cantan números", !!playing);
      s.disconnect();
    }
  } finally {
    // Limpieza: borra el usuario de prueba de producción (cascade).
    await prisma.user.deleteMany({ where: { email } }).catch(() => {});
    await prisma.$disconnect().catch(() => {});
    console.log("\n🧹 usuario de prueba eliminado");
  }

  console.log(`\nRESULTADO PROD: ${passed} ✅ / ${failed} ❌`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
