"use client";

import * as React from "react";
import type { Socket } from "socket.io-client";
import { toast } from "sonner";

import { SiteNav } from "@/components/site-nav";
import { Ticker } from "@/components/ticker";
import { AuthGuard } from "@/components/auth-guard";
import { connectSocket } from "@/lib/socket";
import { useAuth } from "@/lib/auth-context";
import { formatBs } from "@/lib/money";

type Sala = {
  id: string;
  name: string;
  stake: number;
  players: number;
  maxPlayers: number;
  status: string;
};

type Carton = { id: string; grid: number[][]; marked: boolean[][]; hasLine: boolean };

type BingoState = {
  phase: "buying" | "playing" | "finished";
  pot: number;
  stake: number;
  called: number[];
  lastCalled: number | null;
  lastLabel: string | null;
  players: { id: string; name: string; cartones: number }[];
  myCartones: Carton[];
  winners: { id: string; name: string; amount: number }[];
};

type TableMeta = {
  id: string;
  name: string;
  status: string;
  members: { id: string; name: string; connected: boolean }[];
};

const COLS = ["B", "I", "N", "G", "O"];

function CartonView({ carton }: { carton: Carton }) {
  return (
    <div className={`bingo-carton${carton.hasLine ? " win" : ""}`}>
      <div className="bingo-head">
        {COLS.map((c) => (
          <div key={c} className="bingo-col">{c}</div>
        ))}
      </div>
      <div className="bingo-cells">
        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3, 4].map((col) => {
            const v = carton.grid[row][col];
            const marked = carton.marked[row][col];
            const free = v === 0;
            return (
              <div
                key={`${row}-${col}`}
                className="game-cell"
                style={{
                  background: marked ? "var(--green-bright)" : "var(--purple)",
                  color: marked ? "#04210f" : "#fff",
                  fontSize: free ? 12 : 16,
                }}
              >
                {free ? "★" : v}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}

function BingoContent() {
  const { user, refreshUser } = useAuth();
  const [salas, setSalas] = React.useState<Sala[]>([]);
  const [tableId, setTableId] = React.useState<string | null>(null);
  const [game, setGame] = React.useState<BingoState | null>(null);
  const [meta, setMeta] = React.useState<TableMeta | null>(null);
  const socketRef = React.useRef<Socket | null>(null);
  const tableRef = React.useRef<string | null>(null);

  const refreshSalas = React.useCallback(() => {
    socketRef.current?.emit("table:list", { game: "bingo" }, (res: { tables?: Sala[] }) => {
      setSalas(res?.tables ?? []);
    });
  }, []);

  React.useEffect(() => {
    const s = connectSocket();
    socketRef.current = s;

    const onState = (p: { table: TableMeta; game: BingoState }) => {
      setMeta(p.table);
      setGame(p.game);
      if (p.game.phase === "finished") refreshUser(); // el premio ya se acreditó
    };
    s.on("table:state", onState);
    const onConnect = () => refreshSalas();
    s.on("connect", onConnect);
    refreshSalas();

    return () => {
      s.off("table:state", onState);
      s.off("connect", onConnect);
      if (tableRef.current) s.emit("table:leave", { tableId: tableRef.current });
    };
  }, [refreshSalas, refreshUser]);

  function join(id: string) {
    socketRef.current?.emit("table:join", { tableId: id }, (res: { ok: boolean; reason?: string }) => {
      if (res?.ok) {
        tableRef.current = id;
        setTableId(id);
      } else {
        toast.error(res?.reason ?? "No se pudo unir a la sala");
      }
    });
  }

  function leave() {
    if (tableRef.current) socketRef.current?.emit("table:leave", { tableId: tableRef.current });
    tableRef.current = null;
    setTableId(null);
    setGame(null);
    setMeta(null);
    refreshSalas();
  }

  function buy() {
    socketRef.current?.emit(
      "table:action",
      { tableId, action: { type: "buy" } },
      (res: { ok: boolean; reason?: string }) => {
        if (res?.ok) refreshUser();
        else toast.error(res?.reason ?? "No se pudo comprar el cartón");
      },
    );
  }

  function start() {
    socketRef.current?.emit(
      "table:action",
      { tableId, action: { type: "start" } },
      (res: { ok: boolean; reason?: string }) => {
        if (!res?.ok) toast.error(res?.reason ?? "No se pudo iniciar");
      },
    );
  }

  // --- Vista: selección de sala -----------------------------------------
  if (!tableId || !game) {
    return (
      <>
        <SiteNav variant="in" />
        <Ticker />
        <section className="view">
          <div className="wrap">
            <div className="lobby-head">
              <h1>Bingo</h1>
              <p style={{ color: "var(--text-2)", marginTop: 8 }}>
                Elige una sala, compra tu cartón y el primero en hacer línea gana el pozo.
              </p>
            </div>

            <div className="bal-banner" style={{ marginBottom: 28 }}>
              <div className="cell">
                <div className="k">Tu saldo</div>
                <div className="big">{formatBs(user?.balance ?? 0)}</div>
              </div>
            </div>

            <div className="bingo-salas">
              {salas.map((s) => (
                <button key={s.id} className="game-panel bingo-sala" onClick={() => join(s.id)}>
                  <div className="bingo-sala-name serif">{s.name}</div>
                  <div className="bingo-sala-meta">
                    <span>Cartón {formatBs(s.stake)}</span>
                    <span className="live"><span className="live-dot" /> {s.players} jugando</span>
                  </div>
                  <span className="btn btn-gold btn-sm" style={{ marginTop: 12 }}>Entrar</span>
                </button>
              ))}
              {salas.length === 0 && (
                <div style={{ color: "var(--text-2)", padding: 20 }}>Cargando salas…</div>
              )}
            </div>
          </div>
        </section>
      </>
    );
  }

  // --- Vista: dentro de la sala -----------------------------------------
  const phaseLabel =
    game.phase === "buying" ? "Comprando cartones" : game.phase === "playing" ? "En juego" : "Ronda terminada";
  const iWon = game.winners.some((w) => w.id === user?.id);

  return (
    <>
      <SiteNav variant="in" />
      <Ticker />
      <section className="view">
        <div className="wrap">
          <div className="lobby-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1>{meta?.name ?? "Bingo"}</h1>
              <p style={{ color: "var(--text-2)", marginTop: 6 }}>{phaseLabel}</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={leave}>Salir</button>
          </div>

          {/* Resumen de la sala */}
          <div className="bal-banner" style={{ marginBottom: 28 }}>
            <div className="cell">
              <div className="k">Pozo</div>
              <div className="big">{formatBs(game.pot)}</div>
            </div>
            <div className="cell">
              <div className="k">Cartón</div>
              <div className="mid">{formatBs(game.stake)}</div>
            </div>
            <div className="cell">
              <div className="k">Jugadores</div>
              <div className="mid">{game.players.length}</div>
            </div>
            <div className="cell">
              <div className="k">Tu saldo</div>
              <div className="mid">{formatBs(user?.balance ?? 0)}</div>
            </div>
          </div>

          {/* Ganadores */}
          {game.phase === "finished" && game.winners.length > 0 && (
            <div className="bingo-winner">
              {iWon ? "🎉 ¡Ganaste!" : "Ganó " + game.winners.map((w) => w.name).join(", ")} ·{" "}
              {formatBs(game.winners.reduce((s, w) => s + w.amount, 0))} repartidos
            </div>
          )}

          <div className="game-layout">
            {/* Cartones */}
            <div className="game-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h2 style={{ fontSize: 20 }}>Tus cartones</h2>
                {game.phase === "buying" && (
                  <button className="btn btn-gold btn-sm" onClick={buy}>
                    Comprar cartón · {formatBs(game.stake)}
                  </button>
                )}
              </div>
              {game.myCartones.length === 0 ? (
                <div style={{ color: "var(--text-2)", padding: "24px 0", textAlign: "center" }}>
                  {game.phase === "buying"
                    ? "Compra un cartón para jugar."
                    : "No compraste cartón en esta ronda."}
                </div>
              ) : (
                <div className="bingo-cartones">
                  {game.myCartones.map((c) => (
                    <CartonView key={c.id} carton={c} />
                  ))}
                </div>
              )}
            </div>

            {/* Panel derecho */}
            <div className="game-side">
              <div className="game-panel">
                <h2 style={{ fontSize: 20, marginBottom: 14 }}>Número cantado</h2>
                <div className="bingo-last">{game.lastLabel ?? "—"}</div>
                {game.phase === "buying" && (
                  <button
                    className="btn btn-gold btn-block"
                    style={{ marginTop: 16 }}
                    onClick={start}
                    disabled={game.myCartones.length === 0 && game.players.every((p) => p.cartones === 0)}
                  >
                    Iniciar ronda
                  </button>
                )}
                {game.phase === "playing" && (
                  <div style={{ color: "var(--text-2)", fontSize: 13, marginTop: 12, textAlign: "center" }}>
                    Cantando números automáticamente…
                  </div>
                )}
              </div>

              <div className="game-panel">
                <h3 style={{ marginBottom: 12 }}>Cantados ({game.called.length})</h3>
                <div className="bingo-called">
                  {game.called.length === 0 ? (
                    <span style={{ color: "var(--text-2)" }}>Aún no empieza.</span>
                  ) : (
                    game.called.map((n) => (
                      <span key={n} className="bingo-ball">{n}</span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function BingoPage() {
  return (
    <AuthGuard>
      <BingoContent />
    </AuthGuard>
  );
}
