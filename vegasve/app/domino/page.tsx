"use client";

import * as React from "react";
import type { Socket } from "socket.io-client";
import { toast } from "sonner";

import { SiteNav } from "@/components/site-nav";
import { Ticker } from "@/components/ticker";
import { AuthGuard } from "@/components/auth-guard";
import { TurnTimer } from "@/components/turn-timer";
import { TableChat } from "@/components/table-chat";
import { DominoPiece } from "@/components/domino-piece";
import { StageFullscreen } from "@/components/stage-fullscreen";
import { connectSocket } from "@/lib/socket";
import { useAuth } from "@/lib/auth-context";
import { formatBs } from "@/lib/money";
import { sfx } from "@/lib/sfx";

type Mesa = { id: string; name: string; stake: number; players: number; maxPlayers: number; status: string };
type DomTile = { id: string; a: number; b: number };
type Seat = { id: string; name: string; handCount: number; team: number; isTurn: boolean };
type Move = { tileId: string; ends: ("left" | "right")[] };

type DomState = {
  phase: "waiting" | "playing" | "finished";
  pot: number;
  stake: number;
  seats: Seat[];
  board: { a: number; b: number }[];
  leftEnd: number | null;
  rightEnd: number | null;
  turnUserId: string | null;
  myHand: DomTile[];
  mySeat: number;
  myTurn: boolean;
  myLegalMoves: Move[];
  mustPass: boolean;
  winners: { id: string; name: string; amount: number }[];
  seatsNeeded: number;
  turnEndsAt: number | null;
};

type Meta = { id: string; name: string };

type BoardTile = { id: string; a: number; b: number };
let DOM_SEQ = 0;

// Asigna un id estable a cada ficha del tablero para que SOLO la recién colocada
// se anime (las demás conservan su nodo). Detecta el lado de entrada (izq/der)
// para hacer scroll hacia la jugada.
function reconcileBoard(
  prev: BoardTile[],
  board: { a: number; b: number }[],
  sideRef: React.MutableRefObject<"left" | "right" | null>,
): BoardTile[] {
  if (board.length === 0) {
    sideRef.current = null;
    return prev.length ? [] : prev;
  }
  if (prev.length === 0) {
    sideRef.current = "right";
    return board.map((t) => ({ id: `d${DOM_SEQ++}`, a: t.a, b: t.b }));
  }
  if (board.length === prev.length) return prev;
  if (board.length === prev.length + 1) {
    const frontChanged = board[0].a !== prev[0].a || board[0].b !== prev[0].b;
    if (frontChanged) {
      sideRef.current = "left";
      return [{ id: `d${DOM_SEQ++}`, a: board[0].a, b: board[0].b }, ...prev];
    }
    sideRef.current = "right";
    const last = board[board.length - 1];
    return [...prev, { id: `d${DOM_SEQ++}`, a: last.a, b: last.b }];
  }
  sideRef.current = "right";
  return board.map((t) => ({ id: `d${DOM_SEQ++}`, a: t.a, b: t.b }));
}

function DominoContent() {
  const { user, refreshUser } = useAuth();
  const [mesas, setMesas] = React.useState<Mesa[]>([]);
  const [tableId, setTableId] = React.useState<string | null>(null);
  const [game, setGame] = React.useState<DomState | null>(null);
  const [meta, setMeta] = React.useState<Meta | null>(null);
  const [pending, setPending] = React.useState<string | null>(null);
  const socketRef = React.useRef<Socket | null>(null);
  const tableRef = React.useRef<string | null>(null);
  const prevTurn = React.useRef(false);
  const prevBoard = React.useRef(0);
  const prevPhase = React.useRef("");
  const meIdRef = React.useRef<string | null>(null);
  const [boardTiles, setBoardTiles] = React.useState<BoardTile[]>([]);
  const chainRef = React.useRef<HTMLDivElement>(null);
  const feltRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const sideRef = React.useRef<"left" | "right" | null>(null);
  const [boardScale, setBoardScale] = React.useState(1);
  React.useEffect(() => {
    meIdRef.current = user?.id ?? null;
  }, [user?.id]);

  const refreshMesas = React.useCallback(() => {
    socketRef.current?.emit("table:list", { game: "domino" }, (res: { tables?: Mesa[] }) =>
      setMesas(res?.tables ?? []),
    );
  }, []);

  React.useEffect(() => {
    const s = connectSocket();
    socketRef.current = s;
    const onState = (p: { table: Meta; game: DomState }) => {
      const g = p.game;
      if (g.phase === "playing") {
        if (g.board.length > prevBoard.current) sfx.place();
        if (g.myTurn && !prevTurn.current) sfx.turn();
      }
      prevBoard.current = g.board.length;
      prevTurn.current = g.myTurn;
      if (g.phase === "finished" && prevPhase.current !== "finished" && g.winners.some((w) => w.id === meIdRef.current)) {
        sfx.win();
      }
      prevPhase.current = g.phase;
      setMeta(p.table);
      setGame(g);
      setPending(null);
      setBoardTiles((prev) => reconcileBoard(prev, g.board, sideRef));
      if (g.phase === "finished") refreshUser();
    };
    s.on("table:state", onState);
    const onConnect = () => refreshMesas();
    s.on("connect", onConnect);
    const onRejoin = (p: { tableIds?: string[] }) => {
      if (tableRef.current) return;
      const id = (p.tableIds ?? []).find((t) => t.startsWith("domino-") || t.startsWith("practice-domino-"));
      if (!id) return;
      s.emit("table:join", { tableId: id }, (res: { ok: boolean }) => {
        if (res?.ok) {
          tableRef.current = id;
          setTableId(id);
        }
      });
    };
    s.on("table:rejoinable", onRejoin);
    refreshMesas();
    return () => {
      s.off("table:state", onState);
      s.off("connect", onConnect);
      s.off("table:rejoinable", onRejoin);
      if (tableRef.current) s.emit("table:leave", { tableId: tableRef.current });
    };
  }, [refreshMesas, refreshUser]);

  // Auto-ajuste: las fichas se acomodan en filas (usando el alto disponible) y, si
  // ya no caben, se "aleja la vista" escalando la cadena para que TODO quepa sin scroll.
  const fitBoard = React.useCallback(() => {
    const felt = feltRef.current;
    const chain = chainRef.current;
    if (!felt || !chain) return;
    const availW = felt.clientWidth - 20;
    const availH = felt.clientHeight - 20;
    const needW = chain.scrollWidth;
    const needH = chain.scrollHeight;
    if (availW <= 0 || availH <= 0 || needW <= 0 || needH <= 0) {
      setBoardScale(1);
      return;
    }
    setBoardScale(Math.min(1, availW / needW, availH / needH));
  }, []);

  React.useEffect(() => {
    fitBoard();
  }, [boardTiles, fitBoard]);

  React.useEffect(() => {
    window.addEventListener("resize", fitBoard);
    // Al entrar/salir de pantalla completa el tablero debe re-ajustarse.
    const onFs = () => setTimeout(fitBoard, 60);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      window.removeEventListener("resize", fitBoard);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, [fitBoard]);

  // Coloca a cada rival alrededor de la mesa según su posición relativa a mí:
  // el compañero (offset 2) arriba, y los rivales a izquierda/derecha.
  function seatPos(offset: number, total: number): "top" | "left" | "right" | null {
    if (total <= 2) return offset === 1 ? "top" : null;
    if (total === 3) return offset === 1 ? "right" : offset === 2 ? "left" : null;
    return offset === 1 ? "right" : offset === 2 ? "top" : offset === 3 ? "left" : null;
  }

  function join(id: string) {
    socketRef.current?.emit("table:join", { tableId: id }, (res: { ok: boolean; reason?: string }) => {
      if (res?.ok) {
        tableRef.current = id;
        setTableId(id);
      } else toast.error(res?.reason ?? "No se pudo unir");
    });
  }
  function practice() {
    socketRef.current?.emit(
      "table:practice",
      { game: "domino" },
      (res: { ok: boolean; tableId?: string; reason?: string }) => {
        if (res?.ok && res.tableId) join(res.tableId);
        else toast.error(res?.reason ?? "No se pudo crear la práctica");
      },
    );
  }
  function leave() {
    if (tableRef.current) socketRef.current?.emit("table:leave", { tableId: tableRef.current });
    tableRef.current = null;
    setTableId(null);
    setGame(null);
    setMeta(null);
    refreshMesas();
  }
  function action(type: string, extra: Record<string, unknown> = {}) {
    socketRef.current?.emit(
      "table:action",
      { tableId, action: { type, ...extra } },
      (res: { ok: boolean; reason?: string }) => {
        if (res?.ok) {
          if (type === "start") refreshUser();
        } else toast.error(res?.reason ?? "Jugada inválida");
      },
    );
  }

  const legalMap = React.useMemo(() => {
    const m: Record<string, ("left" | "right")[]> = {};
    game?.myLegalMoves.forEach((mv) => (m[mv.tileId] = mv.ends));
    return m;
  }, [game]);

  function clickTile(t: DomTile) {
    if (!game?.myTurn) return;
    const ends = legalMap[t.id];
    if (!ends) return;
    if (ends.length === 1) action("play", { tileId: t.id, end: ends[0] });
    else setPending(pending === t.id ? null : t.id);
  }

  // --- Picker -----------------------------------------------------------
  if (!tableId || !game) {
    return (
      <>
        <SiteNav variant="in" />
        <Ticker />
        <section className="view">
          <div className="wrap">
            <div className="lobby-head">
              <h1>Dominó</h1>
              <p style={{ color: "var(--text-2)", marginTop: 8 }}>
                Mesas 1v1 y por parejas. Apuesta, juega tus fichas y llévate el pozo.
              </p>
              <button className="btn btn-ghost btn-sm practice-cta" onClick={practice}>
                🤖 Practicar vs CPU · gratis
              </button>
            </div>
            <div className="bal-banner" style={{ marginBottom: 28 }}>
              <div className="cell">
                <div className="k">Tu saldo</div>
                <div className="big">{formatBs(user?.balance ?? 0)}</div>
              </div>
            </div>
            <div className="domino-mesas">
              {mesas.map((m) => (
                <button key={m.id} className="game-panel domino-mesa" onClick={() => join(m.id)}>
                  <div className="serif" style={{ fontSize: 22, marginBottom: 8 }}>{m.name}</div>
                  <div className="domino-mesa-meta">
                    <span>Apuesta {formatBs(m.stake)}</span>
                    <span className="live"><span className="live-dot" /> {m.players}/{m.maxPlayers} en mesa</span>
                  </div>
                  <span className="btn btn-gold btn-sm" style={{ marginTop: 12 }}>Sentarse</span>
                </button>
              ))}
              {mesas.length === 0 && <div style={{ color: "var(--text-2)", padding: 20 }}>Cargando mesas…</div>}
            </div>
          </div>
        </section>
      </>
    );
  }

  // --- En mesa ----------------------------------------------------------
  const iWon = game.winners.some((w) => w.id === user?.id);
  const phaseLabel =
    game.phase === "waiting" ? "Esperando jugadores" : game.phase === "playing" ? "En juego" : "Partida terminada";

  return (
    <>
      <SiteNav variant="in" />
      <Ticker />
      <section className="view">
        <div className="wrap">
          <div className="lobby-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1>{meta?.name ?? "Dominó"}</h1>
              <p style={{ color: "var(--text-2)", marginTop: 6 }}>{phaseLabel}</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={leave}>Salir</button>
          </div>

          {/* Todo el juego en un solo recuadro (mesa + mano + acciones) */}
          <div className="game-stage dom-stage" ref={stageRef}>
            <StageFullscreen targetRef={stageRef} />
            <div className="stage-bar">
              <span><i>Pozo</i> {formatBs(game.pot)}</span>
              <span><i>Apuesta</i> {formatBs(game.stake)}</span>
              <span><i>Jugadores</i> {game.seats.length}/{game.seatsNeeded}</span>
              <span><i>Saldo</i> {formatBs(user?.balance ?? 0)}</span>
            </div>

            {game.phase === "finished" && game.winners.length > 0 && (
              <div className="stage-winner">
                {iWon ? "🎉 ¡Ganaste!" : "Ganó " + game.winners.map((w) => w.name).join(" y ")} ·{" "}
                {formatBs(game.winners.reduce((s, w) => s + w.amount, 0))}
              </div>
            )}

            {/* Mesa: rivales alrededor (arriba / izq / der) y el tablero al centro */}
            <div className="dom-table-area">
              {game.seats.map((s, idx) => {
                if (s.id === user?.id) return null;
                const n = game.seats.length || 1;
                const offset = (((idx - game.mySeat) % n) + n) % n;
                const pos = seatPos(offset, game.seatsNeeded);
                if (!pos) return null;
                return (
                  <div key={s.id} className={`dom-player dom-seat ${pos}${s.isTurn ? " turn" : ""}`}>
                    <div className="dom-player-av">{(s.name[0] ?? "?").toUpperCase()}</div>
                    <div className="dom-player-info">
                      <span className="dom-player-name">{s.name}</span>
                    </div>
                    <div className="dom-backs">
                      {Array.from({ length: Math.min(s.handCount, 7) }, (_, i) => (
                        <DominoPiece key={i} a={0} b={0} orientation="v" faceDown />
                      ))}
                    </div>
                    {s.isTurn && <TurnTimer endsAt={game.turnEndsAt} />}
                  </div>
                );
              })}

              {/* Tablero (cadena de fichas) */}
              <div className="dom-felt" ref={feltRef}>
                {game.phase === "waiting" ? (
                  <span className="dom-felt-msg">
                    {game.seats.length < 2 ? "Esperando jugadores…" : "Listos para empezar"}
                  </span>
                ) : game.board.length === 0 ? (
                  <span className="dom-felt-msg">Esperando la salida…</span>
                ) : (
                  <div
                    className="dom-chain"
                    ref={chainRef}
                    style={{ transform: `scale(${boardScale})` }}
                  >
                    {boardTiles.map((t) => (
                      <DominoPiece key={t.id} a={t.a} b={t.b} orientation={t.a === t.b ? "v" : "h"} />
                    ))}
                  </div>
                )}
                {game.board.length > 0 && (
                  <div className="dom-ends">extremos {game.leftEnd} y {game.rightEnd}</div>
                )}
              </div>
            </div>

            {/* Mano + acciones (dentro del mismo recuadro) */}
            <div className="dom-hand-area">
            {game.phase === "waiting" ? (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                {game.seats.length < 2 && (
                  <p style={{ color: "var(--text-2)", marginBottom: 16 }}>Esperando jugadores…</p>
                )}
                <button className="btn btn-gold" onClick={() => action("start")} disabled={game.seats.length < 2}>
                  Iniciar partida · {formatBs(game.stake)}
                </button>
              </div>
            ) : (
              <>
                {/* Etiquetas: en PC ancladas a las esquinas; en celular en una fila propia */}
                <div className="dom-hand-head">
                  <span className="dom-hand-label">Tus fichas</span>
                  {game.phase === "playing" && (
                    <span
                      className="dom-turn-ind"
                      style={{ color: game.myTurn ? "var(--gold)" : "var(--text-2)" }}
                    >
                      {game.myTurn ? "Es tu turno" : "Turno de " + (game.seats.find((s) => s.isTurn)?.name ?? "…")}
                      <TurnTimer endsAt={game.turnEndsAt} />
                    </span>
                  )}
                </div>
                <div className="domino-hand">
                  {game.myHand.length === 0 ? (
                    <span style={{ color: "var(--text-2)" }}>Sin fichas.</span>
                  ) : (
                    game.myHand.map((t) => (
                      <DominoPiece
                        key={t.id}
                        a={t.a}
                        b={t.b}
                        orientation="v"
                        legal={game.myTurn && !!legalMap[t.id]}
                        onClick={game.myTurn && legalMap[t.id] ? () => clickTile(t) : undefined}
                      />
                    ))
                  )}
                  {/* Sin jugada: capa que oscurece las fichas y el botón Pasar al centro */}
                  {game.phase === "playing" && game.mustPass && (
                    <div className="hand-pass-veil">
                      <button className="btn btn-gold btn-sm" onClick={() => action("pass")}>
                        No tengo jugada · Pasar
                      </button>
                    </div>
                  )}
                </div>

                {pending && (
                  <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "var(--text-2)" }}>¿En qué extremo?</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => action("play", { tileId: pending, end: "left" })}>
                      Izquierda ({game.leftEnd})
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => action("play", { tileId: pending, end: "right" })}>
                      Derecha ({game.rightEnd})
                    </button>
                  </div>
                )}
              </>
            )}
            </div>
          </div>

          <TableChat socket={socketRef.current} tableId={tableId} meId={user?.id} />
        </div>
      </section>
    </>
  );
}

export default function DominoPage() {
  return (
    <AuthGuard>
      <DominoContent />
    </AuthGuard>
  );
}
