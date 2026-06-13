"use client";

import * as React from "react";
import type { Socket } from "socket.io-client";
import { toast } from "sonner";

import { SiteNav } from "@/components/site-nav";
import { Ticker } from "@/components/ticker";
import { AuthGuard } from "@/components/auth-guard";
import { TurnTimer } from "@/components/turn-timer";
import { connectSocket } from "@/lib/socket";
import { useAuth } from "@/lib/auth-context";
import { formatBs } from "@/lib/money";

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

function Piece({
  a,
  b,
  onClick,
  legal,
  vertical,
}: {
  a: number;
  b: number;
  onClick?: () => void;
  legal?: boolean;
  vertical?: boolean;
}) {
  return (
    <div
      className={`domino-piece${legal ? " legal" : ""}${onClick ? " clickable" : ""}${vertical ? " vert" : ""}`}
      onClick={onClick}
    >
      <span className="domino-half">{a}</span>
      <span className="domino-div" />
      <span className="domino-half">{b}</span>
    </div>
  );
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

  const refreshMesas = React.useCallback(() => {
    socketRef.current?.emit("table:list", { game: "domino" }, (res: { tables?: Mesa[] }) =>
      setMesas(res?.tables ?? []),
    );
  }, []);

  React.useEffect(() => {
    const s = connectSocket();
    socketRef.current = s;
    const onState = (p: { table: Meta; game: DomState }) => {
      setMeta(p.table);
      setGame(p.game);
      setPending(null);
      if (p.game.phase === "finished") refreshUser();
    };
    s.on("table:state", onState);
    const onConnect = () => refreshMesas();
    s.on("connect", onConnect);
    refreshMesas();
    return () => {
      s.off("table:state", onState);
      s.off("connect", onConnect);
      if (tableRef.current) s.emit("table:leave", { tableId: tableRef.current });
    };
  }, [refreshMesas, refreshUser]);

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

          <div className="bal-banner" style={{ marginBottom: 24 }}>
            <div className="cell"><div className="k">Pozo</div><div className="big">{formatBs(game.pot)}</div></div>
            <div className="cell"><div className="k">Apuesta</div><div className="mid">{formatBs(game.stake)}</div></div>
            <div className="cell"><div className="k">Jugadores</div><div className="mid">{game.seats.length}/{game.seatsNeeded}</div></div>
            <div className="cell"><div className="k">Tu saldo</div><div className="mid">{formatBs(user?.balance ?? 0)}</div></div>
          </div>

          {game.phase === "finished" && game.winners.length > 0 && (
            <div className="bingo-winner">
              {iWon ? "🎉 ¡Ganaste!" : "Ganó " + game.winners.map((w) => w.name).join(" y ")} ·{" "}
              {formatBs(game.winners.reduce((s, w) => s + w.amount, 0))}
            </div>
          )}

          {/* Jugadores */}
          <div className="domino-seats">
            {game.seats.map((s) => (
              <div key={s.id} className={`domino-seat${s.isTurn ? " turn" : ""}`}>
                <div className="domino-seat-name">{s.name}{s.id === user?.id ? " (tú)" : ""}</div>
                <div className="domino-seat-sub">{s.handCount} fichas{game.seatsNeeded === 4 ? ` · Pareja ${s.team + 1}` : ""}</div>
              </div>
            ))}
          </div>

          {/* Mesa / tablero */}
          {game.phase !== "waiting" && (
            <div className="game-panel" style={{ marginBottom: 22 }}>
              <h3 style={{ marginBottom: 14 }}>Mesa {game.board.length > 0 ? `· extremos ${game.leftEnd} y ${game.rightEnd}` : ""}</h3>
              <div className="domino-board">
                {game.board.length === 0 ? (
                  <span style={{ color: "var(--text-2)" }}>Esperando la salida…</span>
                ) : (
                  game.board.map((t, i) => <Piece key={i} a={t.a} b={t.b} vertical={t.a === t.b} />)
                )}
              </div>
            </div>
          )}

          {/* Acciones / mano */}
          <div className="game-panel">
            {game.phase === "waiting" ? (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <p style={{ color: "var(--text-2)", marginBottom: 16 }}>
                  Esperando jugadores ({game.seats.length}/{game.seatsNeeded}). Pueden iniciar con 2 o más.
                </p>
                <button className="btn btn-gold" onClick={() => action("start")} disabled={game.seats.length < 2}>
                  Iniciar partida · {formatBs(game.stake)}
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3>Tus fichas</h3>
                  {game.phase === "playing" && (
                    <span style={{ color: game.myTurn ? "var(--gold)" : "var(--text-2)", fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
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
                      <Piece
                        key={t.id}
                        a={t.a}
                        b={t.b}
                        legal={game.myTurn && !!legalMap[t.id]}
                        onClick={game.myTurn && legalMap[t.id] ? () => clickTile(t) : undefined}
                      />
                    ))
                  )}
                </div>

                {pending && (
                  <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ color: "var(--text-2)" }}>¿En qué extremo?</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => action("play", { tileId: pending, end: "left" })}>
                      Izquierda ({game.leftEnd})
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => action("play", { tileId: pending, end: "right" })}>
                      Derecha ({game.rightEnd})
                    </button>
                  </div>
                )}

                {game.phase === "playing" && game.mustPass && (
                  <button className="btn btn-gold" style={{ marginTop: 16 }} onClick={() => action("pass")}>
                    No tengo jugada · Pasar
                  </button>
                )}
              </>
            )}
          </div>
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
