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

type Mesa = { id: string; name: string; stake: number; players: number; maxPlayers: number; status: string };
type Seat = {
  id: string;
  name: string;
  chips: number;
  roundBet: number;
  folded: boolean;
  allIn: boolean;
  inHand: boolean;
  isButton: boolean;
  isTurn: boolean;
  hole: string[] | null;
};
type Actions = {
  canFold: boolean;
  canCheck: boolean;
  canCall: boolean;
  callAmount: number;
  canRaise: boolean;
  minRaiseTo: number;
  maxRaiseTo: number;
};
type PokerState = {
  phase: string;
  handActive: boolean;
  street: string;
  community: string[];
  pot: number;
  buyIn: number;
  smallBlind: number;
  bigBlind: number;
  toActUserId: string | null;
  seats: Seat[];
  mySeat: number;
  myChips: number;
  myHole: string[];
  myTurn: boolean;
  actions: Actions | null;
  showdown: { id: string; name: string; amount: number; hand?: string }[];
};
type Meta = { id: string; name: string };

const SUIT: Record<string, string> = { s: "♠", h: "♥", d: "♦", c: "♣" };

function PlayingCard({ c, hidden }: { c?: string; hidden?: boolean }) {
  if (hidden || !c) return <div className="pcard back" />;
  const rank = c[0] === "T" ? "10" : c[0];
  const suit = c[1];
  const red = suit === "h" || suit === "d";
  return (
    <div className={`pcard${red ? " red" : ""}`}>
      <span>{rank}</span>
      <span>{SUIT[suit]}</span>
    </div>
  );
}

function PokerContent() {
  const { user, refreshUser } = useAuth();
  const [mesas, setMesas] = React.useState<Mesa[]>([]);
  const [tableId, setTableId] = React.useState<string | null>(null);
  const [game, setGame] = React.useState<PokerState | null>(null);
  const [meta, setMeta] = React.useState<Meta | null>(null);
  const [raiseTo, setRaiseTo] = React.useState(0);
  const socketRef = React.useRef<Socket | null>(null);
  const tableRef = React.useRef<string | null>(null);
  const turnRef = React.useRef(false);

  const refreshMesas = React.useCallback(() => {
    socketRef.current?.emit("table:list", { game: "poker" }, (res: { tables?: Mesa[] }) =>
      setMesas(res?.tables ?? []),
    );
  }, []);

  React.useEffect(() => {
    const s = connectSocket();
    socketRef.current = s;
    const onState = (p: { table: Meta; game: PokerState }) => {
      setMeta(p.table);
      setGame(p.game);
      // Al iniciar mi turno, fija el valor por defecto de subida.
      if (p.game.myTurn && !turnRef.current && p.game.actions) setRaiseTo(p.game.actions.minRaiseTo);
      turnRef.current = p.game.myTurn;
      refreshUser();
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
        if (res?.ok) refreshUser();
        else toast.error(res?.reason ?? "Acción inválida");
      },
    );
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
              <h1>Póker</h1>
              <p style={{ color: "var(--text-2)", marginTop: 8 }}>
                Texas Hold&apos;em en vivo. Compra fichas, juega tus manos y retírate cuando quieras.
              </p>
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
                    <span>Buy-in {formatBs(m.stake)}</span>
                    <span className="live"><span className="live-dot" /> {m.players}/{m.maxPlayers} sentados</span>
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
  const me = game.seats[game.mySeat];
  const needBuyIn = !!user && (game.mySeat < 0 || game.myChips === 0) && !game.seats[game.mySeat]?.inHand;
  const a = game.actions;

  return (
    <>
      <SiteNav variant="in" />
      <Ticker />
      <section className="view">
        <div className="wrap">
          <div className="lobby-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1>{meta?.name ?? "Póker"}</h1>
              <p style={{ color: "var(--text-2)", marginTop: 6 }}>
                {game.handActive ? `Mano en curso · ${game.street}` : "Esperando jugadores"} · Ciegas {formatBs(game.smallBlind)}/{formatBs(game.bigBlind)}
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={leave}>Salir y cobrar</button>
          </div>

          {/* Mesa central */}
          <div className="poker-table">
            <div className="poker-pot">Pozo · {formatBs(game.pot)}</div>
            <div className="poker-community">
              {[0, 1, 2, 3, 4].map((i) => (
                <PlayingCard key={i} c={game.community[i]} hidden={!game.community[i]} />
              ))}
            </div>
          </div>

          {/* Showdown */}
          {!game.handActive && game.showdown.length > 0 && (
            <div className="bingo-winner">
              {game.showdown
                .filter((w) => w.amount > 0)
                .map((w) => `${w.name} gana ${formatBs(w.amount)}${w.hand ? " (" + w.hand + ")" : ""}`)
                .join(" · ") || "Mano terminada"}
            </div>
          )}

          {/* Jugadores */}
          <div className="poker-seats">
            {game.seats.map((s) => (
              <div
                key={s.id}
                className={`poker-seat${s.isTurn ? " turn" : ""}${s.folded ? " folded" : ""}`}
              >
                <div className="poker-seat-top">
                  <span className="poker-seat-name">
                    {s.isButton ? "🔘 " : ""}{s.name}{s.id === user?.id ? " (tú)" : ""}
                  </span>
                  {s.allIn && <span className="poker-allin">ALL-IN</span>}
                </div>
                <div className="poker-seat-cards">
                  {s.hole ? s.hole.map((c, i) => <PlayingCard key={i} c={c} />) :
                    s.inHand ? [<PlayingCard key={0} hidden />, <PlayingCard key={1} hidden />] : null}
                </div>
                <div className="poker-seat-chips">{formatBs(s.chips)}</div>
                {s.roundBet > 0 && <div className="poker-seat-bet">Apuesta {formatBs(s.roundBet)}</div>}
              </div>
            ))}
          </div>

          {/* Acciones */}
          <div className="game-panel" style={{ marginTop: 20 }}>
            {needBuyIn ? (
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "var(--text-2)", marginBottom: 14 }}>
                  Compra fichas para jugar (buy-in {formatBs(game.buyIn)}).
                </p>
                <button className="btn btn-gold" onClick={() => action("buyin")}>
                  Comprar fichas · {formatBs(game.buyIn)}
                </button>
              </div>
            ) : game.myTurn && a ? (
              <div className="poker-actions">
                {a.canFold && <button className="btn btn-ghost" onClick={() => action("fold")}>Retirarse</button>}
                {a.canCheck ? (
                  <button className="btn btn-gold" onClick={() => action("check")}>Pasar</button>
                ) : a.canCall ? (
                  <button className="btn btn-gold" onClick={() => action("call")}>Igualar {formatBs(a.callAmount)}</button>
                ) : null}
                {a.canRaise && (
                  <div className="poker-raise">
                    <input
                      type="number"
                      value={Math.round(raiseTo / 100)}
                      min={Math.ceil(a.minRaiseTo / 100)}
                      max={Math.ceil(a.maxRaiseTo / 100)}
                      onChange={(e) => setRaiseTo(Math.round(Number(e.target.value) * 100))}
                    />
                    <button
                      className="btn btn-green"
                      onClick={() =>
                        action("raise", { amount: Math.max(a.minRaiseTo, Math.min(a.maxRaiseTo, raiseTo)) })
                      }
                    >
                      Subir a {formatBs(Math.max(a.minRaiseTo, Math.min(a.maxRaiseTo, raiseTo)))}
                    </button>
                    <button className="btn btn-gold" onClick={() => action("allin")}>All-in ({formatBs(a.maxRaiseTo)})</button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "var(--text-2)" }}>
                {game.handActive
                  ? "Esperando a los demás jugadores…"
                  : me?.chips
                    ? "La próxima mano comenzará en breve…"
                    : "Compra fichas para entrar a jugar."}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default function PokerPage() {
  return (
    <AuthGuard>
      <PokerContent />
    </AuthGuard>
  );
}
