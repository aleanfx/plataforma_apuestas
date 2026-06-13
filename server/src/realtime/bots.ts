import crypto from "node:crypto";
import type { Hub, Table, TableBots } from "./hub.js";
import type { SocketUser } from "./auth.js";
import type { GameAction } from "./engine.js";

// Jugadores CPU para el modo "Practicar vs CPU". No tienen socket: el controlador
// inspecciona el estado del motor tras cada cambio y, si a un bot le toca actuar,
// programa su acción con un pequeño retraso (para que se sienta natural).

export type BotUser = { id: string; name: string };
export type BotDecider = (state: unknown) => GameAction | null;

const BOT_NAMES = [
  "Carlos", "María", "Luis", "Ana", "Pedro",
  "Sofía", "José", "Carmen", "Miguel", "Valentina",
];

export function makeBots(n: number): BotUser[] {
  const pool = [...BOT_NAMES].sort(() => Math.random() - 0.5).slice(0, n);
  return pool.map((name) => ({ id: `bot:${crypto.randomUUID()}`, name: `CPU ${name}` }));
}

export class BotController implements TableBots {
  private acting = new Set<string>();
  private destroyed = false;

  constructor(
    private hub: Hub,
    private table: Table,
    private bots: BotUser[],
    private decide: BotDecider,
  ) {}

  /** Se llama tras cada cambio de estado. Programa la acción de cada bot que deba jugar. */
  onState(): void {
    if (this.destroyed) return;
    for (const bot of this.bots) {
      if (this.acting.has(bot.id)) continue;
      let action: GameAction | null = null;
      try {
        action = this.decide(this.table.engine.publicState(this.table, bot.id));
      } catch {
        action = null;
      }
      if (!action) continue;
      this.acting.add(bot.id);
      const delay = 700 + Math.floor(Math.random() * 1200); // 0.7–1.9 s
      const t = setTimeout(() => void this.run(bot, action as GameAction), delay);
      t.unref?.();
    }
  }

  private async run(bot: BotUser, action: GameAction) {
    this.acting.delete(bot.id);
    if (this.destroyed) return;
    try {
      await this.table.engine.onAction(this.table, bot as SocketUser, action);
      // Algunas acciones (p. ej. comprar cartón en bingo) no difunden estado solas.
      this.hub.broadcast(this.table);
      this.onState(); // por si otro bot debe seguir
    } catch {
      /* el estado cambió mientras esperábamos; lo ignoramos */
    }
  }

  destroy(): void {
    this.destroyed = true;
  }
}

// --- Lógica de decisión por juego -------------------------------------------

type DominoView = {
  phase: string;
  myTurn: boolean;
  mustPass: boolean;
  myLegalMoves: { tileId: string; ends: ("left" | "right")[] }[];
};

/** Dominó: en su turno juega la primera ficha legal; si no tiene, pasa. */
export const decideDomino: BotDecider = (state) => {
  const s = state as DominoView;
  if (s.phase !== "playing" || !s.myTurn) return null;
  if (s.mustPass) return { type: "pass" };
  const mv = s.myLegalMoves?.[0];
  if (mv) return { type: "play", tileId: mv.tileId, end: mv.ends[0] };
  return { type: "pass" };
};

type PokerView = {
  handActive: boolean;
  myTurn: boolean;
  myChips: number;
  mySeat: number;
  bigBlind: number;
  seats: { inHand: boolean }[];
  actions: {
    canCheck: boolean;
    canCall: boolean;
    callAmount: number;
    canRaise: boolean;
    minRaiseTo: number;
  } | null;
};

/** Póker: compra fichas si no tiene; en su turno juega con una estrategia simple. */
export const decidePoker: BotDecider = (state) => {
  const s = state as PokerView;
  const seat = s.seats?.[s.mySeat];
  if ((s.myChips ?? 0) === 0 && !seat?.inHand) return { type: "buyin" };
  if (!s.myTurn || !s.actions) return null;
  const a = s.actions;
  const bb = s.bigBlind || 1;

  if (a.canCheck) {
    if (a.canRaise && Math.random() < 0.18) return { type: "raise", amount: a.minRaiseTo };
    return { type: "check" };
  }
  if (a.canCall) {
    if (a.callAmount <= bb * 6) {
      if (a.canRaise && Math.random() < 0.12) return { type: "raise", amount: a.minRaiseTo };
      return { type: "call" };
    }
    return Math.random() < 0.4 ? { type: "call" } : { type: "fold" }; // a veces paga apuestas grandes
  }
  return { type: "fold" };
};

type BingoView = { phase: string; myCartones: unknown[] };

/** Bingo: compra un cartón al inicio; el resto es automático. */
export const decideBingo: BotDecider = (state) => {
  const s = state as BingoView;
  if (s.phase === "buying" && (s.myCartones?.length ?? 0) === 0) return { type: "buy" };
  return null;
};
