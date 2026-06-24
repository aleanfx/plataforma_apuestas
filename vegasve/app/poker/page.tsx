"use client";

import * as React from "react";
import type { Socket } from "socket.io-client";
import { toast } from "sonner";

import { SiteNav } from "@/components/site-nav";
import { Ticker } from "@/components/ticker";
import { AuthGuard } from "@/components/auth-guard";
import { StageFullscreen } from "@/components/stage-fullscreen";
import { Cpu, Trophy } from "@/components/icons";
import { connectSocket } from "@/lib/socket";
import { useAuth } from "@/lib/auth-context";
import { useCurrency } from "@/lib/currency-context";
import { sfx } from "@/lib/sfx";

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
  turnEndsAt: number | null;
};
type Meta = { id: string; name: string };

const SUIT: Record<string, string> = { s: "♠", h: "♥", d: "♦", c: "♣" };

function PlayingCard({ c, hidden, big }: { c?: string; hidden?: boolean; big?: boolean }) {
  if (hidden || !c) return <div className={`pkcard back${big ? " big" : ""}`} />;
  const rank = c[0] === "T" ? "10" : c[0];
  const suit = c[1];
  const red = suit === "h" || suit === "d";
  return (
    <div className={`pkcard${red ? " red" : ""}${big ? " big" : ""}`}>
      <span className="pkcard-r">{rank}</span>
      <span className="pkcard-s">{SUIT[suit]}</span>
    </div>
  );
}

// Anillo de tiempo que se llena alrededor de la foto del jugador en turno
// (reemplaza el número en pantalla). Se anima durante el tiempo restante.
function TurnRing({ endsAt }: { endsAt?: number | null }) {
  const [dur, setDur] = React.useState(0);
  React.useEffect(() => {
    setDur(endsAt ? Math.max(0, endsAt - Date.now()) : 0);
  }, [endsAt]);
  if (!endsAt || dur <= 0) return null;
  return <span key={endsAt} className="pk-turn-ring" style={{ animationDuration: `${dur}ms` }} aria-hidden />;
}

// Coloca cada asiento alrededor de la elipse de la mesa; yo (offset 0) abajo.
// En móvil (tight) se ajusta el radio para que el asiento de abajo no se salga
// y deje sitio a la barra de acciones (All-in incluido).
function seatStyle(offset: number, total: number, tight: boolean): React.CSSProperties {
  const a = Math.PI / 2 + (offset / total) * Math.PI * 2;
  const rx = tight ? 44 : 46;
  const ry = tight ? 36 : 45;
  const x = 50 + rx * Math.cos(a);
  const y = 50 + ry * Math.sin(a);
  return { left: `${x}%`, top: `${y}%` };
}

function PokerContent() {
  const { user, refreshUser } = useAuth();
  const { fmt } = useCurrency();
  const [mesas, setMesas] = React.useState<Mesa[]>([]);
  const [tableId, setTableId] = React.useState<string | null>(null);
  const [game, setGame] = React.useState<PokerState | null>(null);
  const [meta, setMeta] = React.useState<Meta | null>(null);
  const [raiseTo, setRaiseTo] = React.useState(0);
  const socketRef = React.useRef<Socket | null>(null);
  const tableRef = React.useRef<string | null>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const turnRef = React.useRef(false);
  const prevCommunity = React.useRef(0);
  const prevHandActive = React.useRef(false);
  const prevPot = React.useRef(0);
  const meIdRef = React.useRef<string | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    meIdRef.current = user?.id ?? null;
  }, [user?.id]);

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const on = () => setIsMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const refreshMesas = React.useCallback(() => {
    socketRef.current?.emit("table:list", { game: "poker" }, (res: { tables?: Mesa[] }) =>
      setMesas(res?.tables ?? []),
    );
  }, []);

  React.useEffect(() => {
    const s = connectSocket();
    socketRef.current = s;
    const onState = (p: { table: Meta; game: PokerState }) => {
      const g = p.game;
      if (g.myTurn && !turnRef.current) sfx.turn();
      if ((g.community?.length ?? 0) > prevCommunity.current) sfx.card();
      prevCommunity.current = g.community?.length ?? 0;
      // Sonido de reparto al empezar una mano; clink de fichas al crecer el pozo.
      if (!prevHandActive.current && g.handActive) sfx.deal();
      else if (g.handActive && g.pot > prevPot.current) sfx.chip();
      prevPot.current = g.pot;
      if (prevHandActive.current && !g.handActive) {
        const mine = g.showdown?.find((sd) => sd.id === meIdRef.current);
        if (mine && mine.amount > 0) sfx.win();
      }
      prevHandActive.current = g.handActive;
      setMeta(p.table);
      setGame(g);
      if (g.myTurn && !turnRef.current && g.actions) setRaiseTo(g.actions.minRaiseTo);
      turnRef.current = g.myTurn;
      refreshUser();
    };
    s.on("table:state", onState);
    const onConnect = () => refreshMesas();
    s.on("connect", onConnect);
    const onRejoin = (p: { tableIds?: string[] }) => {
      if (tableRef.current) return;
      const id = (p.tableIds ?? []).find((t) => t.startsWith("poker-") || t.startsWith("practice-poker-"));
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
      } else toast.error(res?.reason ?? "No se pudo unir");
    });
  }
  function practice() {
    socketRef.current?.emit(
      "table:practice",
      { game: "poker" },
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
    // El clink de fichas de apuestas suena al crecer el pozo (cubre a todos los
    // jugadores). Aquí solo el feedback inmediato de tirar/pasar (no tocan pozo).
    if (type === "fold") sfx.fold();
    else if (type === "check") sfx.check();
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
              <button className="btn btn-ghost btn-sm practice-cta" onClick={practice}>
                <Cpu width="1.05em" height="1.05em" style={{ verticalAlign: "-0.18em", marginRight: 6 }} />
                Practicar vs CPU · gratis
              </button>
            </div>
            <div className="bal-banner" style={{ marginBottom: 28 }}>
              <div className="cell">
                <div className="k">Tu saldo</div>
                <div className="big">{fmt(user?.balance ?? 0)}</div>
              </div>
            </div>
            <div className="domino-mesas">
              {mesas.map((m) => (
                <button key={m.id} className="game-panel domino-mesa" onClick={() => join(m.id)}>
                  <div className="serif" style={{ fontSize: 22, marginBottom: 8 }}>{m.name}</div>
                  <div className="domino-mesa-meta">
                    <span>Buy-in {fmt(m.stake)}</span>
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
  const n = game.seats.length || 1;
  const base = game.mySeat >= 0 ? game.mySeat : 0;
  const iWon = game.showdown.some((w) => w.id === user?.id && w.amount > 0);

  return (
    <>
      {!immersive && <SiteNav variant="in" />}
      {!immersive && <Ticker />}
      <section className="view">
        <div className="wrap">
          {!immersive && (
            <div className="lobby-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h1>{meta?.name ?? "Póker"}</h1>
                <p style={{ color: "var(--text-2)", marginTop: 6 }}>
                  {game.handActive
                    ? `Mano en curso · ${game.street}`
                    : `Ciegas ${fmt(game.smallBlind)}/${fmt(game.bigBlind)}`}
                </p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={leave}>Salir y cobrar</button>
            </div>
          )}

          <div className={`game-stage pk-stage${immersive ? " pk-immersive" : ""}`} ref={stageRef}>
            {immersive ? (
              <button className="stage-exit" onClick={leave} aria-label="Salir">Salir</button>
            ) : (
              <StageFullscreen targetRef={stageRef} />
            )}

            <div className="stage-bar">
              <span><i>Pozo</i> {fmt(game.pot)}</span>
              <span><i>Ciegas</i> {fmt(game.smallBlind)}/{fmt(game.bigBlind)}</span>
              <span><i>Jugadores</i> {n}</span>
              <span><i>Saldo</i> {fmt(user?.balance ?? 0)}</span>
            </div>

            {!game.handActive && game.showdown.length > 0 && (
              <div className="stage-winner">
                <Trophy width="1.05em" height="1.05em" style={{ verticalAlign: "-0.18em", marginRight: 6 }} />
                {iWon
                  ? "¡Ganaste la mano!"
                  : game.showdown
                      .filter((w) => w.amount > 0)
                      .map((w) => `${w.name} gana ${fmt(w.amount)}${w.hand ? " (" + w.hand + ")" : ""}`)
                      .join(" · ") || "Mano terminada"}
              </div>
            )}

            {/* Mesa ovalada con asientos alrededor */}
            <div className="pk-table-wrap">
              <div className="pk-felt">
                <div className="pk-center">
                  <div className="pk-pot"><span className="pk-chip-ico" aria-hidden />{fmt(game.pot)}</div>
                  <div className="pk-community">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <PlayingCard key={game.community[i] ?? `c${i}`} c={game.community[i]} hidden={!game.community[i]} />
                    ))}
                  </div>
                  {game.street && game.street !== "idle" && game.handActive && (
                    <div className="pk-street">{game.street}</div>
                  )}
                </div>
              </div>

              {game.seats.map((s, idx) => {
                const offset = ((idx - base) % n + n) % n;
                const isMe = s.id === user?.id;
                return (
                  <div
                    key={s.id}
                    className={`pk-seat${s.isTurn ? " turn" : ""}${s.folded ? " folded" : ""}${isMe ? " me" : ""}`}
                    style={seatStyle(offset, n, immersive)}
                  >
                    {s.roundBet > 0 && <div className="pk-bet" key={s.roundBet}>{fmt(s.roundBet)}</div>}
                    <div className="pk-seat-cards">
                      {s.hole
                        ? s.hole.map((c, i) => <PlayingCard key={i} c={c} big={isMe} />)
                        : s.inHand
                          ? [<PlayingCard key={0} hidden big={isMe} />, <PlayingCard key={1} hidden big={isMe} />]
                          : null}
                    </div>
                    <div className="pk-seat-plate">
                      <div className="pk-seat-av">
                        {(s.name[0] ?? "?").toUpperCase()}
                        {s.isButton && <span className="pk-dealer">D</span>}
                        {s.isTurn && <TurnRing endsAt={game.turnEndsAt} />}
                      </div>
                      <div className="pk-seat-info">
                        <span className="pk-seat-name">{s.name}{isMe ? " (tú)" : ""}</span>
                        <span className="pk-seat-chips">{fmt(s.chips)}</span>
                      </div>
                    </div>
                    {s.allIn && <span className="pk-allin">ALL-IN</span>}
                  </div>
                );
              })}
            </div>

            {/* Barra de acciones */}
            <div className="pk-actionbar">
              {needBuyIn ? (
                <div className="pk-buyin">
                  <span>Compra fichas para jugar (buy-in {fmt(game.buyIn)}).</span>
                  <button className="btn btn-gold" onClick={() => action("buyin")}>
                    Comprar fichas · {fmt(game.buyIn)}
                  </button>
                </div>
              ) : game.myTurn && a ? (
                <div className="poker-actions">
                  {a.canFold && <button className="btn btn-ghost" onClick={() => action("fold")}>Retirarse</button>}
                  {a.canCheck ? (
                    <button className="btn btn-gold" onClick={() => action("check")}>Pasar</button>
                  ) : a.canCall ? (
                    <button className="btn btn-gold" onClick={() => action("call")}>Igualar {fmt(a.callAmount)}</button>
                  ) : null}
                  {a.canRaise && (
                    <div className="poker-raise">
                      <input
                        type="range"
                        value={raiseTo}
                        min={a.minRaiseTo}
                        max={a.maxRaiseTo}
                        step={Math.max(1, game.bigBlind)}
                        onChange={(e) => setRaiseTo(Number(e.target.value))}
                      />
                      <button
                        className="btn btn-green"
                        onClick={() =>
                          action("raise", { amount: Math.max(a.minRaiseTo, Math.min(a.maxRaiseTo, raiseTo)) })
                        }
                      >
                        Subir a {fmt(Math.max(a.minRaiseTo, Math.min(a.maxRaiseTo, raiseTo)))}
                      </button>
                      <button className="btn btn-gold" onClick={() => action("allin")}>All-in</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pk-wait">
                  {game.handActive
                    ? ""
                    : me?.chips
                      ? "La próxima mano comenzará en breve…"
                      : "Compra fichas para entrar a jugar."}
                </div>
              )}
            </div>
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
