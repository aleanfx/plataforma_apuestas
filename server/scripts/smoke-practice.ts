// Smoke test del modo "Practicar vs CPU": confirma que los bots juegan solos.
// El humano = este script. Que el juego avance (domino termine, poker reparta una
// mano, bingo arranque con cartones de CPU) prueba que los bots actuaron.
import { io, type Socket } from "socket.io-client";

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
    const t = setTimeout(() => resolve({ _timeout: true }), 5000);
    s.emit(ev, data, (r: unknown) => { clearTimeout(t); resolve(r); });
  });
function waitState(s: Socket, pred: (g: any) => boolean, timeoutMs: number) {
  return new Promise<any>((resolve) => {
    const t = setTimeout(() => resolve(null), timeoutMs);
    const h = (p: any) => { if (pred(p.game)) { clearTimeout(t); s.off("table:state", h); resolve(p); } };
    s.on("table:state", h);
  });
}

async function main() {
  const ts = Date.now();
  const r = await rest("POST", "/auth/register", undefined, {
    email: `practice_${ts}@betmarplay.test`, name: "Humano", password: "secret123",
  });
  const token = r.data.access;
  const myId = r.data.user.id as string;

  // ---------- DOMINÓ ----------
  console.log("\n--- Práctica DOMINÓ (humano + 1 CPU) ---");
  {
    const s = await connect(token);
    const pr = await emit(s, "table:practice", { game: "domino" });
    check("mesa de práctica creada", pr?.ok === true && !!pr.tableId, pr);
    const tableId = pr.tableId;
    await emit(s, "table:join", { tableId });
    // El humano juega sus turnos; el CPU juega los suyos.
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
    const started = await emit(s, "table:action", { tableId, action: { type: "start" } });
    check("partida iniciada", started?.ok === true, started);
    const fin = await waitState(s, (g) => g.phase === "finished", 25000);
    check("la partida termina (el CPU jugó sus turnos)", !!fin, "no terminó en 25s");
    s.disconnect();
  }

  // ---------- PÓKER ----------
  console.log("\n--- Práctica PÓKER (humano + 3 CPU) ---");
  {
    const s = await connect(token);
    const pr = await emit(s, "table:practice", { game: "poker" });
    check("mesa de práctica creada", pr?.ok === true && !!pr.tableId, pr);
    const tableId = pr.tableId;
    let sawHand = false;
    s.on("table:state", async (p: any) => {
      const g = p.game;
      if (g.handActive) sawHand = true;
      if (g.myChips === 0 && !g.seats?.[g.mySeat]?.inHand) {
        await emit(s, "table:action", { tableId, action: { type: "buyin" } });
      } else if (g.myTurn && g.actions) {
        const a = g.actions;
        const act = a.canCheck ? "check" : a.canCall && a.callAmount <= (g.bigBlind || 1) * 4 ? "call" : "fold";
        await emit(s, "table:action", { tableId, action: { type: act } });
      }
    });
    await emit(s, "table:join", { tableId });
    const hand = await waitState(s, (g) => g.handActive === true, 20000);
    check("se reparte una mano (los CPU compraron y se jugó)", !!hand || sawHand, "no hubo mano en 20s");
    const community = await waitState(s, (g) => (g.community?.length ?? 0) >= 3, 20000);
    check("llegan cartas comunitarias (la mano avanza)", !!community, "no hubo flop");
    s.disconnect();
  }

  // ---------- BINGO ----------
  console.log("\n--- Práctica BINGO (humano + 4 CPU) ---");
  {
    const s = await connect(token);
    const pr = await emit(s, "table:practice", { game: "bingo" });
    check("mesa de práctica creada", pr?.ok === true && !!pr.tableId, pr);
    const tableId = pr.tableId;
    await emit(s, "table:join", { tableId });
    await emit(s, "table:action", { tableId, action: { type: "buy" } }); // el humano compra
    const withBots = await waitState(s, (g) => (g.players?.length ?? 0) >= 3, 8000);
    check("los CPU compraron cartones (>=3 jugadores)", !!withBots, "los bots no compraron");
    const playing = await waitState(s, (g) => g.phase === "playing" && (g.called?.length ?? 0) > 0, 20000);
    check("la ronda arranca y se cantan números", !!playing, "no arrancó");
    s.disconnect();
  }

  console.log(`\nRESULTADO: ${passed} ✅ / ${failed} ❌`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
