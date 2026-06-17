"use client";

import * as React from "react";
import type { Socket } from "socket.io-client";
import { toast } from "sonner";

import { SiteNav } from "@/components/site-nav";
import { Ticker } from "@/components/ticker";
import { AuthGuard } from "@/components/auth-guard";
import { TableChat } from "@/components/table-chat";
import { StageFullscreen } from "@/components/stage-fullscreen";
import { Cpu, Trophy } from "@/components/icons";
import { connectSocket } from "@/lib/socket";
import { useAuth } from "@/lib/auth-context";
import { formatBs } from "@/lib/money";
import { sfx } from "@/lib/sfx";

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
const BOARD_RANGES: [string, number][] = [["B", 1], ["I", 16], ["N", 31], ["G", 46], ["O", 61]];

// Todas las líneas posibles de un cartón 5x5 (filas, columnas y 2 diagonales).
const ALL_LINES: [number, number][][] = (() => {
  const lines: [number, number][][] = [];
  for (let r = 0; r < 5; r++) lines.push([0, 1, 2, 3, 4].map((c) => [r, c] as [number, number]));
  for (let c = 0; c < 5; c++) lines.push([0, 1, 2, 3, 4].map((r) => [r, c] as [number, number]));
  lines.push([0, 1, 2, 3, 4].map((i) => [i, i] as [number, number]));
  lines.push([0, 1, 2, 3, 4].map((i) => [i, 4 - i] as [number, number]));
  return lines;
})();

/** La mejor línea del cartón: cuántas casillas le faltan y cuáles son. */
function bestLine(carton: Carton): { remaining: number; cells: [number, number][] } {
  let best: { remaining: number; cells: [number, number][] } = { remaining: 99, cells: [] };
  for (const line of ALL_LINES) {
    const rem = line.filter(([r, c]) => !carton.marked[r][c]).length;
    if (rem < best.remaining) best = { remaining: rem, cells: line };
  }
  return best;
}

function CartonView({ carton, n }: { carton: Carton; n: number }) {
  const info = bestLine(carton);
  const win = carton.hasLine;
  const ready = !win && info.remaining === 1; // a una bola de cantar línea
  const winCells = win ? new Set(info.cells.map(([r, c]) => r * 5 + c)) : null;
  return (
    <div className={`bingo-carton${win ? " win" : ready ? " ready" : ""}`}>
      <div className="bingo-carton-top">
        <span className="bingo-carton-tag">Cartón {n}</span>
        {win && <span className="bingo-carton-badge win">¡LÍNEA!</span>}
        {ready && <span className="bingo-carton-badge">¡Te falta 1!</span>}
      </div>
      <div className="bingo-head">
        {COLS.map((c, i) => (
          <div key={c} className={`bingo-col col-${i}`}>{c}</div>
        ))}
      </div>
      <div className="bingo-cells">
        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3, 4].map((col) => {
            const v = carton.grid[row][col];
            const marked = carton.marked[row][col];
            const free = v === 0;
            const onWin = winCells?.has(row * 5 + col);
            return (
              <div
                key={`${row}-${col}`}
                className={`bingo-cell col-${col}${marked ? " marked" : ""}${free ? " free" : ""}${onWin ? " winline" : ""}`}
              >
                <span className="bingo-cell-num">{free ? "★" : v}</span>
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
  const stageRef = React.useRef<HTMLDivElement>(null);
  const prevCalled = React.useRef(0);
  const prevPhase = React.useRef("");
  const [isMobile, setIsMobile] = React.useState(false);

  // ¿Celular? -> modo inmersivo (pantalla completa) mientras se juega.
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const on = () => setIsMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const refreshSalas = React.useCallback(() => {
    socketRef.current?.emit("table:list", { game: "bingo" }, (res: { tables?: Sala[] }) => {
      setSalas(res?.tables ?? []);
    });
  }, []);

  React.useEffect(() => {
    const s = connectSocket();
    socketRef.current = s;

    const onState = (p: { table: TableMeta; game: BingoState }) => {
      const g = p.game;
      if (g.phase === "playing" && g.called.length > prevCalled.current) sfx.call();
      prevCalled.current = g.called.length;
      if (g.phase === "finished" && prevPhase.current !== "finished" && g.myCartones?.some((c) => c.hasLine)) {
        sfx.win();
      }
      prevPhase.current = g.phase;
      setMeta(p.table);
      setGame(g);
      if (g.phase === "finished") refreshUser(); // el premio ya se acreditó
    };
    s.on("table:state", onState);
    const onConnect = () => refreshSalas();
    s.on("connect", onConnect);
    // Reconexión: si al (re)conectar el servidor dice que seguimos en una mesa de
    // bingo, volvemos a entrar (p. ej. tras refrescar la página a mitad de ronda).
    const onRejoin = (p: { tableIds?: string[] }) => {
      if (tableRef.current) return;
      const id = (p.tableIds ?? []).find((t) => t.startsWith("bingo-") || t.startsWith("practice-bingo-"));
      if (!id) return;
      s.emit("table:join", { tableId: id }, (res: { ok: boolean }) => {
        if (res?.ok) {
          tableRef.current = id;
          setTableId(id);
        }
      });
    };
    s.on("table:rejoinable", onRejoin);
    refreshSalas();

    return () => {
      s.off("table:state", onState);
      s.off("connect", onConnect);
      s.off("table:rejoinable", onRejoin);
      if (tableRef.current) s.emit("table:leave", { tableId: tableRef.current });
    };
  }, [refreshSalas, refreshUser]);

  // Modo inmersivo (celular en sala): el juego ocupa la pantalla completa.
  const immersive = isMobile && !!tableId && !!game;
  React.useEffect(() => {
    document.body.classList.toggle("immersive-on", immersive);
    return () => document.body.classList.remove("immersive-on");
  }, [immersive]);

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

  function practice() {
    socketRef.current?.emit(
      "table:practice",
      { game: "bingo" },
      (res: { ok: boolean; tableId?: string; reason?: string }) => {
        if (res?.ok && res.tableId) join(res.tableId);
        else toast.error(res?.reason ?? "No se pudo crear la práctica");
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
                Elige una sala, compra hasta 4 cartones y el primero en hacer línea gana el pozo.
              </p>
              <button className="btn btn-ghost btn-sm practice-cta" onClick={practice}>
                <Cpu width="1.05em" height="1.05em" style={{ verticalAlign: "-0.18em", marginRight: 6 }} />
                Practicar vs CPU · gratis
              </button>
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
  const iWon = game.winners.some((w) => w.id === user?.id);
  const myCount = game.myCartones.length;
  const phaseLabel =
    game.phase === "buying" ? "Comprando cartones" : game.phase === "playing" ? "En juego" : "Ronda terminada";
  const history = game.called.slice(-7).reverse(); // últimas bolas (la más nueva primero)

  return (
    <>
      {!immersive && <SiteNav variant="in" />}
      {!immersive && <Ticker />}
      <section className="view">
        <div className="wrap">
          {!immersive && (
            <div className="lobby-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h1>{meta?.name ?? "Bingo"}</h1>
                <p style={{ color: "var(--text-2)", marginTop: 6 }}>{phaseLabel}</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={leave}>Salir</button>
            </div>
          )}

          {/* Todo el juego en un solo recuadro (bola + tablero + cartones) */}
          <div className={`game-stage bingo-stage${immersive ? " bingo-immersive" : ""}`} ref={stageRef}>
            {immersive ? (
              <button className="stage-exit" onClick={leave} aria-label="Salir">Salir</button>
            ) : (
              <StageFullscreen targetRef={stageRef} />
            )}

            <div className="stage-bar">
              <span><i>Pozo</i> {formatBs(game.pot)}</span>
              <span><i>Cartón</i> {formatBs(game.stake)}</span>
              <span><i>Jugadores</i> {game.players.length}</span>
              <span><i>Saldo</i> {formatBs(user?.balance ?? 0)}</span>
            </div>

            {game.phase === "finished" && game.winners.length > 0 && (
              <div className="stage-winner">
                <Trophy width="1.05em" height="1.05em" style={{ verticalAlign: "-0.18em", marginRight: 6 }} />
                {iWon ? "¡Ganaste!" : "Ganó " + game.winners.map((w) => w.name).join(", ")} ·{" "}
                {formatBs(game.winners.reduce((s, w) => s + w.amount, 0))}
              </div>
            )}

            <div className="bingo-arena">
              {/* Columna del cantor: bola 3D + tablero 1-75 + acciones */}
              <div className="bingo-caller">
                <div className="bingo-ball-wrap">
                  <div className="bingo-last" key={game.lastCalled ?? "none"}>{game.lastLabel ?? "—"}</div>
                  <div className="bingo-caller-state">
                    {game.phase === "buying"
                      ? "Compra tus cartones"
                      : game.phase === "playing"
                        ? `Bola ${game.called.length} de 75`
                        : "Ronda terminada"}
                  </div>
                  {history.length > 0 && (
                    <div className="bingo-history">
                      {history.map((n, i) => (
                        <span key={`${n}-${i}`} className={`bingo-history-ball${i === 0 ? " last" : ""}`}>
                          {COLS[Math.floor((n - 1) / 15)]}
                          {n}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {game.phase === "buying" && (
                  <div className="bingo-actions">
                    <button
                      className="btn btn-gold btn-block"
                      onClick={buy}
                      disabled={myCount >= 4}
                    >
                      {myCount >= 4 ? "Máximo 4 cartones" : `Comprar cartón · ${formatBs(game.stake)}`}
                    </button>
                    <button
                      className="btn btn-ghost btn-block"
                      style={{ marginTop: 8 }}
                      onClick={start}
                      disabled={myCount === 0 && game.players.every((p) => p.cartones === 0)}
                    >
                      Iniciar ronda
                    </button>
                  </div>
                )}

                <div className="bingo-board">
                  {BOARD_RANGES.map(([letter, startN]) => (
                    <div className="bingo-board-row" key={letter}>
                      <span className="bingo-board-letter">{letter}</span>
                      {Array.from({ length: 15 }, (_, i) => {
                        const num = startN + i;
                        const on = game.called.includes(num);
                        const last = num === game.lastCalled;
                        return (
                          <span key={num} className={`bingo-cell-n${on ? " on" : ""}${last ? " last" : ""}`}>
                            {num}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cartones del jugador */}
              <div className="bingo-cards">
                <div className="bingo-cards-head">
                  <h2>Tus cartones {myCount > 0 && <span className="bingo-cards-count">{myCount}/4</span>}</h2>
                  {game.phase === "buying" && myCount < 4 && (
                    <button className="btn btn-gold btn-sm" onClick={buy}>+ Cartón</button>
                  )}
                </div>

                {myCount === 0 ? (
                  <div className="bingo-empty">
                    {game.phase === "buying"
                      ? "Compra un cartón para entrar a la ronda."
                      : "No compraste cartón en esta ronda."}
                  </div>
                ) : (
                  <div className={`bingo-cartones n${myCount}`}>
                    {game.myCartones.map((c, i) => (
                      <CartonView key={c.id} carton={c} n={i + 1} />
                    ))}
                  </div>
                )}

                {game.players.length > 1 && (
                  <div className="bingo-players">
                    {game.players.map((p) => (
                      <span key={p.id} className={`bingo-player-chip${p.id === user?.id ? " me" : ""}`}>
                        {p.name} · {p.cartones}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <TableChat socket={socketRef.current} tableId={tableId} meId={user?.id} />
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
